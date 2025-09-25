import React from 'react';
import { Pressable, ViewStyle } from 'react-native';

type Props = { onPress?: () => void; style?: ViewStyle; children: React.ReactNode };
export default function IconButton({ onPress, style, children }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ padding: 8, borderRadius: 10, opacity: pressed ? 0.7 : 1 }, style]}>
      {children}
    </Pressable>
  );
}
