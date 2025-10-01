import { useNotesStore } from "@/src/state/notesStore";
import type { Note } from "@/src/types/note";
import { isEffectivelyEmpty } from "@/src/utils/editorText";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { AppState, TextInput } from "react-native";
import type { RichEditor } from "react-native-pell-rich-editor";

type RouteParams = { id?: string; type?: Note["type"]; nonce?: string };

type UseNoteEditorOptions = {
  defaultTextColor: string;
};

export function useNoteEditor({ defaultTextColor }: UseNoteEditorOptions) {
  const params = useLocalSearchParams<RouteParams>();
  const nav = useNavigation<any>();

  const id = params.id as string | undefined;
  const type = (params.type as Note["type"]) ?? "note";
  const nonce = params.nonce as string | undefined;

  const getById = useNotesStore((s) => s.getById);
  const createEmpty = useNotesStore((s) => s.createEmpty);
  const add = useNotesStore((s) => s.add);
  const update = useNotesStore((s) => s.update);
  const purge = useNotesStore((s) => s.purge);

  const editorRef = useRef<RichEditor>(null);
  const titleInputRef = useRef<TextInput>(null);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const createdNewRef = useRef(false);
  const lastNonceRef = useRef<string | undefined>(undefined);

  const existing = id ? getById(id) : undefined;
  const initial = useMemo(
    () =>
      existing ??
      ({ id: "", title: "Untitled", content: "", type } as Pick<
        Note,
        "id" | "title" | "content" | "type"
      >),
    [existing, type]
  );

  const [noteId, setNoteId] = useState<string>(initial.id);
  const [title, setTitle] = useState<string>(initial.title);
  const [content, setContent] = useState<string>(initial.content);

  const latestTitle = useRef(title);
  const latestContent = useRef(content);
  useEffect(() => void (latestTitle.current = title), [title]);
  useEffect(() => void (latestContent.current = content), [content]);

  const [foreColorOpen, setForeColorOpen] = useState(false);
  const [hiliteColorOpen, setHiliteColorOpen] = useState(false);

  useEffect(() => {
    if (id) {
      createdNewRef.current = false;
      if (!existing) add({ id, title, content, type });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!id && nonce && nonce !== lastNonceRef.current) {
      lastNonceRef.current = nonce;
      const n = createEmpty(type);
      createdNewRef.current = true;
      setNoteId(n.id);
      setTitle(n.title);
      setContent(n.content);
      latestTitle.current = n.title;
      latestContent.current = n.content;
      add({ id: n.id, title: n.title, content: n.content, type: n.type });

      const t = setTimeout(() => titleInputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [id, nonce, type, createEmpty, add]);

  useEffect(() => {
    if (id) {
      const n = getById(id);
      if (n) {
        createdNewRef.current = false;
        setNoteId(n.id);
        setTitle(n.title);
        setContent(n.content);
        latestTitle.current = n.title;
        latestContent.current = n.content;
      } else {
        add({ id, title: "Untitled", content: "", type });
        createdNewRef.current = false;
        setNoteId(id);
        setTitle("Untitled");
        setContent("");
        latestTitle.current = "Untitled";
        latestContent.current = "";
      }
      lastNonceRef.current = undefined;
    }
  }, [id, getById, add, type]);

  const scheduleUpdate = useMemo(() => {
    return (patch: Partial<Note>) => {
      if (!noteId) return;
      if (
        createdNewRef.current &&
        isEffectivelyEmpty(latestTitle.current, latestContent.current)
      ) {
        return;
      }
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = setTimeout(() => {
        update(noteId, patch);
        pendingTimerRef.current = null;
      }, 220);
    };
  }, [noteId, update]);

  const flushSave = useCallback(() => {
    if (!noteId) return;

    if (
      createdNewRef.current &&
      isEffectivelyEmpty(latestTitle.current, latestContent.current)
    ) {
      purge(noteId);
      return;
    }

    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    update(noteId, {
      title: latestTitle.current,
      content: latestContent.current,
    });
  }, [noteId, update, purge]);

  const flushAndGoBack = useCallback(() => {
    flushSave();
    requestAnimationFrame(() => nav.goBack());
  }, [flushSave, nav]);

  useEffect(() => {
    const onAppStateChange = (nextState: string) => {
      if (
        appStateRef.current === "active" &&
        /inactive|background/.test(nextState)
      ) {
        flushSave();
      }
      appStateRef.current = nextState as any;
    };
    const sub = AppState.addEventListener("change", onAppStateChange);
    return () => sub.remove();
  }, [flushSave]);

  const restoreSelection = useCallback(() => {
    editorRef.current?.focusContentEditor();
  }, []);

  const injectEditorCSS = useCallback(() => {
    const css = `
      html, body { margin:0; padding:0; }
      html { -webkit-text-size-adjust: none; text-size-adjust: none; }
      body { line-height: 1.4; }
      p { margin: 0; }
      p + p { margin-top: 8px; }
      span[style*="background-color"] { line-height: 1.4; }
    `;
    const js = `
      (function(){
        var el = document.getElementById('editor-base-css');
        if (!el) {
          el = document.createElement('style');
          el.id = 'editor-base-css';
          el.type = 'text/css';
          el.appendChild(document.createTextNode(${JSON.stringify(css)}));
          document.head.appendChild(el);
        }
        return true;
      })();
      true;`;
    editorRef.current?.commandDOM(js);
  }, []);

  useEffect(() => {
    const t = setTimeout(injectEditorCSS, 50);
    return () => clearTimeout(t);
  }, [injectEditorCSS]);

  const normalizeDoc = useCallback(() => {
    const js = `
      (function(){
        document.querySelectorAll('span').forEach(sp => {
          if (!sp.textContent && !sp.querySelector('*')) sp.remove();
        });
        document.querySelectorAll('br + br').forEach(br => br.remove());
        return true;
      })();
      true;`;
    editorRef.current?.commandDOM(js);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => normalizeDoc(), 0);
    return () => clearTimeout(t);
  }, [content, normalizeDoc]);

  const onChangeTitle = useCallback(
    (t: string) => {
      latestTitle.current = t;
      setTitle(t);
      scheduleUpdate({ title: t });
    },
    [scheduleUpdate]
  );

  const onChangeContent = useCallback(
    (html: string) => {
      latestContent.current = html;
      setContent(html);
      scheduleUpdate({ content: html });
    },
    [scheduleUpdate]
  );

  const applyForeColor = useCallback(
    (hex: string | null) => {
      const color = hex ?? defaultTextColor;
      restoreSelection();
      editorRef.current?.commandDOM(
        `try{document.execCommand('styleWithCSS', true);}catch(e){};true;`
      );
      editorRef.current?.commandDOM(
        `document.execCommand('foreColor', false, '${color}');`
      );
      setForeColorOpen(false);
    },
    [defaultTextColor, restoreSelection]
  );

  const applyHiliteColor = useCallback(
    (hex: string | null) => {
      restoreSelection();
      editorRef.current?.commandDOM(
        `try{document.execCommand('styleWithCSS', true);}catch(e){};true;`
      );
      if (hex) {
        editorRef.current?.commandDOM(`
        (function(){
          try { document.execCommand('hiliteColor', false, '${hex}'); }
          catch(e) { try { document.execCommand('backColor', false, '${hex}'); } catch(_){} }
          return true;
        })();
        true;
      `);
      } else {
        editorRef.current?.commandDOM(`
        (function(){
          try { document.execCommand('hiliteColor', false, 'transparent'); }
          catch(e) { try { document.execCommand('backColor', false, 'transparent'); } catch(_){} }
          try{
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return true;
            const container = sel.anchorNode && (sel.anchorNode.parentElement || document.body);
            const spans = container ? container.querySelectorAll('span') : [];
            spans.forEach(function(sp){
              if (sp.style && sp.style.backgroundColor){
                sp.style.backgroundColor = '';
                if (!sp.getAttribute('style')) sp.removeAttribute('style');
              }
            });
          }catch(e){}
          return true;
        })();
        true;
      `);
      }
      setHiliteColorOpen(false);
    },
    [restoreSelection]
  );

  const editorKey = `ed-${noteId || nonce || "pending"}`;
  const toolbarKey = `tb-${noteId || nonce || "pending"}`;

  return {
    editorRef,
    titleInputRef,

    noteId,
    editorKey,
    toolbarKey,

    title,
    content,
    foreColorOpen,
    hiliteColorOpen,

    setForeColorOpen,
    setHiliteColorOpen,

    onChangeTitle,
    onChangeContent,
    applyForeColor,
    applyHiliteColor,
    injectEditorCSS,
    normalizeDoc,
    flushSave,
    flushAndGoBack,
  };
}
