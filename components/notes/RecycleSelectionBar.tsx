import { Portal } from '@gorhom/portal';
import { useAppTheme } from '@/providers/ThemeProvider';
import { RotateCcw, Trash2, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  count: number;
  onClose: () => void;
  onRestore: () => void;
  onDeleteForever: () => void;
};

export default function RecycleSelectionBar({
  count,
  onClose,
  onRestore,
  onDeleteForever,
}: Props) {
  const { theme } = useAppTheme();
  const T = theme.tokens;

  return (
    <Portal>
      <View
        style={[
          s.wrap,
          {
            backgroundColor: T.colors.card,
            borderColor: T.colors.border,
          },
        ]}
      >
        <Text style={[s.count, { color: T.colors.text }]}>{count} selected</Text>

      <Pressable onPress={onRestore} style={s.btn} accessibilityLabel="Restore">
        <RotateCcw size={22} color={T.colors.text} />
        <Text style={[s.btnText, { color: T.colors.text }]}>Restore</Text>
      </Pressable>

      <Pressable onPress={onDeleteForever} style={s.btn} accessibilityLabel="Delete forever">
        <Trash2 size={22} color={T.colors.text} />
        <Text style={[s.btnText, { color: T.colors.text }]}>Delete</Text>
      </Pressable>

      <Pressable
        onPress={onClose}
        style={[s.btn, { marginLeft: 'auto' }]}
        accessibilityLabel="Close selection"
      >
        <X size={22} color={T.colors.text} />
      </Pressable>
      </View>
    </Portal>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 0,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  count: {
    fontWeight: '600',
    fontSize: 14,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  btnText: {
    fontWeight: '600',
  },
});
