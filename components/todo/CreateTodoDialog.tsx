import { useAppTheme } from '@/providers/ThemeProvider';
import { Portal } from '@gorhom/portal';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export type TodoPayload = { title: string }; // note removed

type Props = {
  visible: boolean;
  mode?: 'create' | 'edit';
  initial?: Partial<TodoPayload>;
  onClose: () => void;
  onCreate?: (p: TodoPayload) => void;
  onUpdate?: (p: TodoPayload) => void;
  confirmLabel?: string;
};

export default function CreateTodoDialog({
  visible,
  mode = 'create',
  initial,
  onClose,
  onCreate,
  onUpdate,
  confirmLabel,
}: Props) {
  const { theme } = useAppTheme();
  const T = theme.tokens;

  const [title, setTitle] = useState(initial?.title ?? '');

  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? '');
  }, [visible, initial?.title]);

  const reset = () => setTitle('');

  const handleConfirm = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const payload: TodoPayload = { title: trimmed };
    mode === 'edit' ? onUpdate?.(payload) : onCreate?.(payload);
    if (mode === 'create') reset();
    onClose();
  };

  const btnText = confirmLabel ?? (mode === 'edit' ? 'Save' : 'Create');

  if (!visible) return null;

  return (
    <Portal>
      <Pressable onPress={onClose} style={s.backdrop} />

      <View pointerEvents="box-none" style={s.centerLayer}>
        <KeyboardAvoidingView enabled={Platform.OS === 'ios'} behavior="padding" style={s.kav}>
          <View
            onStartShouldSetResponder={() => true}
            style={[s.card, { backgroundColor: T.colors.bg, borderRadius: T.radius }]}
          >
            <View style={s.header}>
              <Text style={[s.h, { color: T.colors.text }]}>{mode === 'edit' ? 'Edit To-do' : 'New To-do'}</Text>
              <Pressable hitSlop={10} onPress={onClose}>
                <X size={20} color={T.colors.text} />
              </Pressable>
            </View>

            {/* Title only */}
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor={T.colors.placeholder}
              maxLength={75}
              style={[
                s.input,
                s.inputTitle,
                { borderRadius: T.radius, color: T.colors.text, backgroundColor: T.colors.card },
              ]}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleConfirm}
            />

            <View style={s.actions}>
              <Pressable onPress={onClose} style={[s.btn, s.ghost]}>
                <Text style={[s.btnText, { color: T.colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                disabled={!title.trim()}
                style={({ pressed }) => [
                  s.btn,
                  {
                    backgroundColor: !title.trim() ? 'rgba(0,0,0,0.15)' : T.colors.accent,
                    opacity: pressed ? 0.95 : 1,
                  },
                ]}
              >
                <Text style={[s.btnText, { color: '#fff' }]}>{btnText}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Portal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  centerLayer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  kav: { width: '100%', alignItems: 'center' },
  card: {
    width: '90%',
    minWidth: 300,
    maxWidth: 520,
    padding: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h: { fontSize: 18, fontWeight: '700' },
  input: {
    borderWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputTitle: { marginTop: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  btn: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  btnText: { fontWeight: '700' },
  ghost: { backgroundColor: 'transparent' },
});
