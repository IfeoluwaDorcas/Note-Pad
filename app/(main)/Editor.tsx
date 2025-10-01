import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Highlighter,
  Italic,
  List,
  Palette,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react-native";
import React from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";

import ColorPickerModal from "@/components/editor/ColorPickerModal";
import { useNoteEditor } from "@/hooks/useNoteEditor";
import { useAppTheme } from "@/providers/ThemeProvider";

type ToolbarIconProps = { tintColor?: string };
const FORE_COLOR = "foreColorCustom" as const;
const HILITE_COLOR = "hiliteColorCustom" as const;

export default function NoteEditorScreen() {
  const { theme } = useAppTheme();
  const c = theme.tokens.colors;
  const s = theme.nav.colors;

  const {
    editorRef,
    titleInputRef,
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
    flushAndGoBack,
  } = useNoteEditor({ defaultTextColor: c.text });

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity
          onPress={flushAndGoBack}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={c.text} />
        </TouchableOpacity>
        <TextInput
          ref={titleInputRef}
          value={title}
          onChangeText={onChangeTitle}
          placeholder="Title"
          placeholderTextColor={s.notification}
          style={[styles.titleInput, { color: c.text }]}
          returnKeyType="next"
          onSubmitEditing={() => editorRef.current?.focusContentEditor()}
        />
      </View>

      <RichEditor
        key={editorKey}
        ref={editorRef}
        useContainer
        initialContentHTML={content}
        editorStyle={{
          backgroundColor: c.bg,
          color: c.text,
          placeholderColor: s.notification,
        }}
        placeholder="Start typing…"
        onChange={onChangeContent}
        style={styles.editor}
        androidLayerType={Platform.OS === "android" ? "none" : undefined}
      />

      <View style={[styles.toolbarWrap, { borderTopColor: c.border }]}>
        <RichToolbar
          key={toolbarKey}
          editor={editorRef}
          selectedIconTint={c.text}
          disabledIconTint={s.notification}
          iconTint={c.text}
          actions={[
            actions.insertBulletsList,
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.alignLeft,
            actions.alignCenter,
            actions.alignRight,
            actions.undo,
            actions.redo,
            FORE_COLOR,
            HILITE_COLOR,
          ]}
          iconMap={{
            [actions.insertBulletsList]: ({ tintColor }: ToolbarIconProps) => (
              <List size={16} color={tintColor} />
            ),
            [actions.setBold]: ({ tintColor }: ToolbarIconProps) => (
              <Bold size={16} color={tintColor} />
            ),
            [actions.setItalic]: ({ tintColor }: ToolbarIconProps) => (
              <Italic size={16} color={tintColor} />
            ),
            [actions.setUnderline]: ({ tintColor }: ToolbarIconProps) => (
              <Underline size={16} color={tintColor} />
            ),
            [actions.alignLeft]: ({ tintColor }: ToolbarIconProps) => (
              <AlignLeft size={16} color={tintColor} />
            ),
            [actions.alignCenter]: ({ tintColor }: ToolbarIconProps) => (
              <AlignCenter size={16} color={tintColor} />
            ),
            [actions.alignRight]: ({ tintColor }: ToolbarIconProps) => (
              <AlignRight size={16} color={tintColor} />
            ),
            [actions.undo]: ({ tintColor }: ToolbarIconProps) => (
              <Undo2 size={16} color={tintColor} />
            ),
            [actions.redo]: ({ tintColor }: ToolbarIconProps) => (
              <Redo2 size={16} color={tintColor} />
            ),
            [FORE_COLOR]: ({ tintColor }: ToolbarIconProps) => (
              <TouchableOpacity
                onPress={() => setForeColorOpen(true)}
                hitSlop={8}
              >
                <Palette size={16} color={tintColor} />
              </TouchableOpacity>
            ),
            [HILITE_COLOR]: ({ tintColor }: ToolbarIconProps) => (
              <TouchableOpacity
                onPress={() => setHiliteColorOpen(true)}
                hitSlop={8}
              >
                <Highlighter size={16} color={tintColor} />
              </TouchableOpacity>
            ),
          }}
          style={[styles.toolbar, { backgroundColor: c.bg }]}
        />
      </View>

      <ColorPickerModal
        visible={foreColorOpen}
        onClose={() => setForeColorOpen(false)}
        onPick={applyForeColor}
        title="Text color"
        themeColors={{ card: c.card, text: c.text, border: c.border }}
      />

      <ColorPickerModal
        visible={hiliteColorOpen}
        onClose={() => setHiliteColorOpen(false)}
        onPick={applyHiliteColor}
        title="Highlight color"
        swatches={[
          "#fff59d",
          "#a7f3d0",
          "#bfdbfe",
          "#fde68a",
          "#fecaca",
          "#e9d5ff",
          "#bbf7d0",
          "#fef3c7",
        ]}
        themeColors={{ card: c.card, text: c.text, border: c.border }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: Platform.select({
      ios: "Inter",
      android: "Inter_400Regular",
      default: "Inter",
    }) as any,
  },
  headerActions: { flexDirection: "row", gap: 8, marginLeft: 6 },
  iconBtn: { padding: 6, borderRadius: 10 },
  editor: { flex: 1, paddingHorizontal: 12 },
  toolbarWrap: { borderTopWidth: StyleSheet.hairlineWidth },
  toolbar: { height: 48 },
});
