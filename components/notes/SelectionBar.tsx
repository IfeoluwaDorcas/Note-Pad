import { useAppTheme } from '@/providers/ThemeProvider';
import { Share2, Trash2, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  count: number;
  onClose: () => void;
  onDelete: () => void;
  onShare?: () => void;
};

export default function SelectionBar({
  count,
  onClose,
  onDelete,
  onShare,
}: Props) {
  const { theme } = useAppTheme();
  const T = theme.tokens;

  return (
    <View
      style={[
        s.wrap,
        {
          backgroundColor: T.colors.card,
          borderColor: T.colors.border,
        },
      ]}
    >
      <View style={[s.cell, s.textCell]}>
        <Text style={[s.count, { color: T.colors.text }]}>{count} selected</Text>
      </View>

      <View style={s.cell}>
        <Pressable
          onPress={onDelete}
          style={s.touch}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Delete"
        >
          <Trash2 size={22} color={T.colors.text} />
        </Pressable>
      </View>

      <View style={s.cell}>
        <Pressable
          onPress={onShare}
          disabled
          style={s.touch}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          accessibilityLabel="Share (coming soon)"
        >
          <Share2 size={22} color={T.colors.textMuted} />
        </Pressable>
      </View>

      <View style={s.cell}>
        <Pressable
          onPress={onClose}
          style={s.touch}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close selection"
        >
          <X size={22} color={T.colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  textCell: {
    alignItems: 'center',
    margin: 10,
  },
  count: {
    fontWeight: '600',
    fontSize: 14,
  },
  touch: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
});
