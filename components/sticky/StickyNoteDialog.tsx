import { useAppTheme } from '@/providers/ThemeProvider';
import { Portal } from '@gorhom/portal';
import { Check, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export type StickyPayload = { title: string; content: string; color: string };

type Props = {
  visible: boolean;
  mode?: 'create' | 'edit';
  initial?: Partial<StickyPayload>;
  onClose: () => void;
  onCreate?: (p: StickyPayload) => void;
  onUpdate?: (p: StickyPayload) => void;
  colors?: string[];
  confirmLabel?: string;
};

export default function CreateStickyDialog({
  visible,
  mode = 'create',
  initial,
  onClose,
  onCreate,
  onUpdate,
  colors,
  confirmLabel,
}: Props) {
  const { theme } = useAppTheme();
  const T = theme.tokens;

  const swatches = useMemo(
    () =>
      colors ??
      ['#FF6F61', '#FFC94D', '#4CAF81', '#4AA8FF', '#A88BFF', '#FF82B2', '#26A69A', '#9E9E9E'],
    [colors]
  );

  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [color, setColor] = useState(initial?.color ?? swatches[0]);

  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? '');
    setContent(initial?.content ?? '');
    setColor(initial?.color ?? swatches[0]);
  }, [visible, initial?.title, initial?.content, initial?.color, swatches]);

  const reset = () => {
    setTitle('');
    setContent('');
    setColor(swatches[0]);
  };

  const handleConfirm = () => {
    if (!title.trim()) return;
    const payload: StickyPayload = { title: title.trim(), content: content.trim(), color };
    mode === 'edit' ? onUpdate?.(payload) : onCreate?.(payload);
    if (mode === 'create') reset();
    onClose();
  };

  const btnText = confirmLabel ?? (mode === 'edit' ? 'Save' : 'Create');

  const GAP = 11;
  const [rowWidth, setRowWidth] = useState(0);

  const swatchSize = useMemo(() => {
    if (!rowWidth || swatches.length === 0) return 32;
    const MAX = 32;
    const available = rowWidth - GAP * (swatches.length - 1);
    return Math.min(MAX, Math.floor(available / swatches.length));
  }, [rowWidth, swatches.length]);

  const onRowLayout = (e: LayoutChangeEvent) => {
    setRowWidth(e.nativeEvent.layout.width);
  };

  if (!visible) return null;

  return (
    <Portal>
      <Pressable onPress={onClose} style={styles.backdrop} />

      <View pointerEvents="box-none" style={styles.centerLayer}>
        <KeyboardAvoidingView enabled={Platform.OS === 'ios'} behavior="padding" style={styles.kav}>
          <View
            onStartShouldSetResponder={() => true}
            style={[styles.card, { backgroundColor: T.colors.bg, borderRadius: T.radius }]}
          >
            <View style={styles.header}>
              <Text style={[styles.h, { color: T.colors.text }]}>
                {mode === 'edit' ? 'Edit Pin' : 'New Pin'}
              </Text>
              <Pressable hitSlop={10} onPress={onClose}>
                <X size={20} color={T.colors.text} />
              </Pressable>
            </View>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor={T.colors.placeholder}
              maxLength={35}
              style={[
                styles.input,
                styles.inputTitle,
                { borderRadius: T.radius, color: T.colors.text, backgroundColor: T.colors.card },
              ]}
            />
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Content"
              placeholderTextColor={T.colors.placeholder}
              multiline
              maxLength={320}
              style={[
                styles.input,
                styles.inputContent,
                { borderRadius: T.radius, color: T.colors.text, backgroundColor: T.colors.card },
              ]}
            />

            <Text style={[styles.section, { color: T.colors.text }]}>Color</Text>
            <View
              style={[styles.row, { flexWrap: 'nowrap' }]}
              onLayout={onRowLayout}
            >
              {swatches.map((c) => {
                const selected = c === color;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setColor(c)}
                    style={[
                      styles.swatch,
                      {
                        backgroundColor: c,
                        borderWidth: 0,
                        height: swatchSize,
                        width: swatchSize,
                        borderRadius: swatchSize / 2,
                      },
                    ]}
                  >
                    {selected && (
                      <Check
                        size={Math.max(12, Math.floor(swatchSize * 0.55))}
                        color="#fff"
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actions}>
              <Pressable onPress={onClose} style={[styles.btn, styles.ghost]}>
                <Text style={[styles.btnText, { color: T.colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                disabled={!title.trim()}
                style={({ pressed }) => [
                  styles.btn,
                  {
                    backgroundColor: !title.trim() ? 'rgba(0,0,0,0.15)' : T.colors.accent,
                    opacity: pressed ? 0.95 : 1,
                  },
                ]}
              >
                <Text style={[styles.btnText, { color: '#fff' }]}>{btnText}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  centerLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kav: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    padding: 25,
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h: { fontSize: 18, fontWeight: '700' },
  input: {
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputTitle: { marginTop: 12, fontWeight: '700' },
  inputContent: { marginTop: 15, minHeight: 110, textAlignVertical: 'top' },
  section: { marginTop: 14, marginBottom: 8, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  swatch: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 25 },
  btn: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  btnText: { fontWeight: '700' },
  ghost: { backgroundColor: 'transparent' },
});
