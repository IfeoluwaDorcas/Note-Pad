import { useAppTheme } from '@/providers/ThemeProvider';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

type Props = {
  onPress: () => void;
};

export default function FloatingActionButton({ onPress }: Props) {
  const { theme } = useAppTheme();
  const c = theme.tokens.colors;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: c.accent,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Plus size={24} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 70,
    right: 24,
    borderRadius: 28,
    height: 56,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
});
