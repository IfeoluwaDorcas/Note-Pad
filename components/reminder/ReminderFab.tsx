import { useTheme } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

export default function ReminderFab({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add reminder"
      hitSlop={8}
      style={({ pressed }) => [s.button, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
    >
      <Plus size={24} color="#fff" />
    </Pressable>
  );
}
const s = StyleSheet.create({
  button: {
    position: 'absolute', bottom: 70, right: 24, height: 56, width: 56,
    borderRadius: 28, justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5,
  },
});
