import { useAppTheme } from '@/providers/ThemeProvider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SectionHeader({ title }: { title: string }) {
  const { theme } = useAppTheme();
  const T = theme.tokens;
  return (
    <View style={[s.wrap, { backgroundColor: T.colors.card, borderRadius: T.radius }]}>
      <Text style={[s.text, { color: T.colors.textMuted }]}>{title}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingVertical: 12, marginBottom: 6 },
  text: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
});
