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
  ScrollView,
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
import Screen from "@/components/Screen";
import { useNoteEditor } from "@/hooks/useNoteEditor";
import { useAppTheme } from "@/providers/ThemeProvider";
type ToolbarIconProps = { tintColor?: string };
const FORE_COLOR = "foreColorCustom" as const;
const HILITE_COLOR = "hiliteColorCustom" as const;

export default function NoteEditorScreen() {
  const { theme } = useAppTheme();
  const c = theme.tokens.colors;
  const s = theme.nav.colors;
  const fs = theme.tokens.fontScale;
  const webviewProps = {
    showsVerticalScrollIndicator: false,
    showsHorizontalScrollIndicator: false,
    overScrollMode: "never" as const,
  };

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
    saveSelection,
    onChangeTitle,
    onChangeContent,
    applyForeColor,
    applyHiliteColor,
    flushAndGoBack,
  } = useNoteEditor({ defaultTextColor: c.text });

  return (
    <Screen edges={["top", "bottom"]}>
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
            style={[
              styles.titleInput,
              { color: c.text, fontSize: fs(18), lineHeight: fs(28) },
            ]}
            returnKeyType="next"
            onSubmitEditing={() => editorRef.current?.focusContentEditor()}
          />
        </View>
        <View style={styles.editorScroll}>
          <ScrollView
            contentContainerStyle={styles.editorScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <RichEditor
              key={editorKey}
              ref={editorRef}
              useContainer
              {...(webviewProps as any)}
              initialContentHTML={content}
              editorStyle={{
                backgroundColor: c.bg,
                color: c.text,
                placeholderColor: s.notification,
                contentCSSText: `body{font-size:${fs(16)}px; line-height:1.9;}`,
              }}
              placeholder="Start typing…"
              onChange={onChangeContent}
              style={styles.editor}
              androidLayerType={Platform.OS === "android" ? "none" : undefined}
            />
          </ScrollView>
        </View>
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
              [actions.insertBulletsList]: ({ tintColor }) => (
                <List size={20} color={tintColor} />
              ),
              [actions.setBold]: ({ tintColor }) => (
                <Bold size={20} color={tintColor} />
              ),
              [actions.setItalic]: ({ tintColor }) => (
                <Italic size={20} color={tintColor} />
              ),
              [actions.setUnderline]: ({ tintColor }) => (
                <Underline size={20} color={tintColor} />
              ),
              [actions.alignLeft]: ({ tintColor }) => (
                <AlignLeft size={20} color={tintColor} />
              ),
              [actions.alignCenter]: ({ tintColor }) => (
                <AlignCenter size={20} color={tintColor} />
              ),
              [actions.alignRight]: ({ tintColor }) => (
                <AlignRight size={20} color={tintColor} />
              ),
              [actions.undo]: ({ tintColor }) => (
                <Undo2 size={20} color={tintColor} />
              ),
              [actions.redo]: ({ tintColor }) => (
                <Redo2 size={20} color={tintColor} />
              ),
              [FORE_COLOR]: ({ tintColor }) => (
                <TouchableOpacity
                  onPress={() => {
                    saveSelection();
                    setForeColorOpen(true);
                  }}
                  hitSlop={8}
                >
                  <Palette size={16} color={tintColor} />
                </TouchableOpacity>
              ),
              [HILITE_COLOR]: ({ tintColor }) => (
                <TouchableOpacity
                  onPress={() => {
                    saveSelection();
                    setHiliteColorOpen(true);
                  }}
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
          themeColors={{ card: c.card, text: c.text, border: c.border }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 600,
    fontFamily: Platform.select({
      ios: "Inter",
      android: "Inter_400Regular",
      default: "Inter",
    }) as any,
  },
  headerActions: { flexDirection: "row", gap: 8, marginLeft: 6 },
  iconBtn: { padding: 6, borderRadius: 10 },
  editorScroll: { flex: 1 },
  editorScrollContent: { flexGrow: 1 },
  editor: { flex: 1 },
  toolbarWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolbar: { height: 48 },
});
