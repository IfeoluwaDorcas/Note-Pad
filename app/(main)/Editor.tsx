import { useNotesStore } from '@/src/state/notesStore';
import type { Note } from '@/src/types/note';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Columns,
  Highlighter,
  Italic,
  List,
  MoreVertical,
  Palette,
  Plus,
  Redo2,
  Underline,
  Undo2,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

import ColorPickerModal from '@/components/editor/ColorPickerModal';
import { useTheme } from '@react-navigation/native';

const FONT_SIZE = 'fontSize' as const;
const FORE_COLOR = 'foreColorCustom' as const;
const HILITE_COLOR = 'hiliteColorCustom' as const;

const FONT_SIZES = [13, 15, 17, 19, 21, 24, 28, 32] as const;

type RouteParams = { id?: string; type?: Note['type'] };
type ToolbarIconProps = { tintColor?: string };

export default function NoteEditorScreen() {
  const nav = useNavigation();
  const { colors } = useTheme();
  const route = useRoute();
  const { id, type } = (route.params || {}) as RouteParams;

  const editorRef = useRef<RichEditor>(null);

  const getById = useNotesStore(s => s.getById);
  const createEmpty = useNotesStore(s => s.createEmpty);
  const add = useNotesStore(s => s.add);
  const update = useNotesStore(s => s.update);

  const initialNote = useMemo(() => {
    if (id) return getById(id) ?? createEmpty(type);
    return createEmpty(type);
  }, [getById, createEmpty, id, type]);

  const [noteId] = useState(initialNote.id);
  const [title, setTitle] = useState(initialNote.title);
  const [content, setContent] = useState(initialNote.content);

  // Modals
  const [sizePickerOpen, setSizePickerOpen] = useState(false);
  const [foreColorOpen, setForeColorOpen] = useState(false);
  const [hiliteColorOpen, setHiliteColorOpen] = useState(false);

  useMemo(() => {
    if (!id) add({ id: noteId, content, title, type: type ?? 'note' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced updates
  const scheduleUpdate = useMemo(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    return (patch: Partial<Note>) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => update(noteId, patch), 220);
    };
  }, [noteId, update]);

  const onChangeTitle = useCallback((t: string) => {
    setTitle(t);
    scheduleUpdate({ title: t });
  }, [scheduleUpdate]);

  const onChangeContent = useCallback((html: string) => {
    setContent(html);
    scheduleUpdate({ content: html });
  }, [scheduleUpdate]);

  // ---------------- Font size ----------------
  const applyFontSize = useCallback((px: number) => {
    editorRef.current?.commandDOM(`document.execCommand('fontSize', false, 7);`);
    const js = `
      (function(){
        var fonts = document.getElementsByTagName('font');
        for (var i = 0; i < fonts.length; i++) {
          if (fonts[i].size == '7') {
            fonts[i].removeAttribute('size');
            fonts[i].style.fontSize = '${px}px';
          }
        }
      })();
      true;`;
    editorRef.current?.commandDOM(js);
    setSizePickerOpen(false);
  }, []);

  // ---------------- Colors ----------------
  const applyForeColor = useCallback((hex: string | null) => {
    const color = hex ?? colors.text;
    editorRef.current?.commandDOM(`document.execCommand('foreColor', false, '${color}');`);
    setForeColorOpen(false);
  }, [colors.text]);

  const applyHiliteColor = useCallback((hex: string | null) => {
    const color = hex ?? 'transparent';
    editorRef.current?.commandDOM(`document.execCommand('hiliteColor', false, '${color}');`);
    setHiliteColorOpen(false);
  }, []);

  const handleToolbarPress = useCallback((payload: unknown) => {
    const action =
      typeof payload === 'string'
        ? payload
        : (payload as { action?: string } | null)?.action;

    if (!action) return;

    if (action === FONT_SIZE) {
      setSizePickerOpen(true);
      return;
    }
    if (action === FORE_COLOR) {
      setForeColorOpen(true);
      return;
    }
    if (action === HILITE_COLOR) {
      setHiliteColorOpen(true);
      return;
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Go back">
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <TextInput
          value={title}
          onChangeText={onChangeTitle}
          placeholder="Title"
          placeholderTextColor={colors.notification}
          style={[styles.titleInput, { color: colors.text }]}
        />
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Columns size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Plus size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MoreVertical size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Editor */}
      <RichEditor
        ref={editorRef}
        initialContentHTML={content}
        editorStyle={{
          backgroundColor: colors.background,
          color: colors.text,
          placeholderColor: colors.notification,
        }}
        placeholder="Start typing…"
        onChange={onChangeContent}
        style={styles.editor}
        androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
      />

      {/* Toolbar */}
      <View style={[styles.toolbarWrap, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <RichToolbar
          editor={editorRef}
          selectedIconTint={colors.text}
          disabledIconTint={colors.notification}
          iconTint={colors.text}
          actions={[
            actions.insertBulletsList,
            actions.setBold,
            actions.setItalic,
            FONT_SIZE,
            actions.setUnderline,
            actions.alignLeft,
            actions.alignCenter,
            actions.alignRight,
            actions.alignFull,
            actions.undo,
            actions.redo,
            FORE_COLOR,
            HILITE_COLOR,
          ]}
          iconMap={{
            [actions.insertBulletsList]: ({ tintColor }: ToolbarIconProps) => <List size={18} color={tintColor} />,
            [actions.setBold]: ({ tintColor }: ToolbarIconProps) => <Bold size={18} color={tintColor} />,
            [actions.setItalic]: ({ tintColor }: ToolbarIconProps) => <Italic size={18} color={tintColor} />,
            [actions.setUnderline]: ({ tintColor }: ToolbarIconProps) => <Underline size={18} color={tintColor} />,
            [actions.alignLeft]: ({ tintColor }: ToolbarIconProps) => <AlignLeft size={18} color={tintColor} />,
            [actions.alignCenter]: ({ tintColor }: ToolbarIconProps) => <AlignCenter size={18} color={tintColor} />,
            [actions.alignRight]: ({ tintColor }: ToolbarIconProps) => <AlignRight size={18} color={tintColor} />,
            [actions.alignFull]: ({ tintColor }: ToolbarIconProps) => <AlignJustify size={18} color={tintColor} />,
            [actions.undo]: ({ tintColor }: ToolbarIconProps) => <Undo2 size={18} color={tintColor} />,
            [actions.redo]: ({ tintColor }: ToolbarIconProps) => <Redo2 size={18} color={tintColor} />,
            [FORE_COLOR]: ({ tintColor }: ToolbarIconProps) => <Palette size={18} color={tintColor} />,
            [HILITE_COLOR]: ({ tintColor }: ToolbarIconProps) => <Highlighter size={18} color={tintColor} />,
            [FONT_SIZE]: ({ tintColor }: ToolbarIconProps) => (
              <View style={styles.fontSizeBtn}>
                <Text style={{ color: tintColor, fontWeight: '600' }}>A▼</Text>
              </View>
            ),
          }}
          onPress={handleToolbarPress}
          style={styles.toolbar}
        />
      </View>

      {/* Font size picker */}
      <Modal visible={sizePickerOpen} transparent animationType="fade" onRequestClose={() => setSizePickerOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSizePickerOpen(false)}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Font size</Text>
            <FlatList
              data={FONT_SIZES as readonly number[]}
              keyExtractor={(k) => String(k)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.sizeRow} onPress={() => applyFontSize(item)}>
                  <Text style={[styles.sizeLabel, { color: colors.text, fontSize: item }]}>{item}px</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Fore color */}
      <ColorPickerModal
        visible={foreColorOpen}
        onClose={() => setForeColorOpen(false)}
        onPick={applyForeColor}
        title="Text color"
        themeColors={{ card: colors.card, text: colors.text, border: colors.border }}
      />

      {/* Highlight color */}
      <ColorPickerModal
        visible={hiliteColorOpen}
        onClose={() => setHiliteColorOpen(false)}
        onPick={applyHiliteColor}
        title="Highlight color"
        swatches={['#fff59d','#a7f3d0','#bfdbfe','#fde68a','#fecaca','#e9d5ff','#bbf7d0','#fef3c7']}
        themeColors={{ card: colors.card, text: colors.text, border: colors.border }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: Platform.select({ ios: 'Inter', android: 'Inter_400Regular', default: 'Inter' }) as any,
  },
  headerActions: { flexDirection: 'row', gap: 8, marginLeft: 6 },
  iconBtn: { padding: 6, borderRadius: 10 },
  editor: { flex: 1, paddingHorizontal: 12 },
  toolbarWrap: { borderTopWidth: StyleSheet.hairlineWidth },
  toolbar: { height: 48 },
  fontSizeBtn: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  modalSheet: { paddingVertical: 12, borderTopLeftRadius: 14, borderTopRightRadius: 14, maxHeight: '50%' },
  modalTitle: { fontSize: 16, fontWeight: '600', paddingHorizontal: 16, paddingBottom: 8 },
  sizeRow: { paddingVertical: 10, paddingHorizontal: 16 },
  sizeLabel: { fontWeight: '500' },
});
