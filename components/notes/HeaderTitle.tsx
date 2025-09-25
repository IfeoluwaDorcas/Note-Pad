import { useAppTheme } from '@/providers/ThemeProvider';
import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  count?: number;
  noun?: string;
  subtitle?: string;
};

function pluralize(noun: string, count: number) {
  if (count === 1) return noun;
  const lower = noun.toLowerCase();
  if (/(s|x|z|ch|sh)$/.test(lower)) return noun + 'es';
  if (/[bcdfghjklmnpqrstvwxyz]y$/i.test(noun)) return noun.slice(0, -1) + 'ies';
  return noun + 's';
}

export default function HeaderTitle({ title, count, noun, subtitle }: Props) {
  const { theme } = useAppTheme();
  const T = theme.tokens;

  const autoSubtitle =
    typeof count === 'number' && noun
      ? `${count} ${pluralize(noun, count)}`
      : undefined;

  const finalSubtitle = subtitle ?? autoSubtitle;

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '800', color: T.colors.text }}>
        {title}
      </Text>

      {!!finalSubtitle && (
        <Text style={{ fontSize: 12, opacity: 0.7, color: T.colors.text }}>
          {finalSubtitle}
        </Text>
      )}
    </View>
  );
}
