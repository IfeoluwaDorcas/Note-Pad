import { useAppTheme } from '@/providers/ThemeProvider';
import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  noun?: string;
  count?: number;
};

function HeaderTitle({ title, subtitle }: Props) {
  const { theme } = useAppTheme();
  const T = theme.tokens;

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '800', color: T.colors.text }}>
        {title}
      </Text>

      {!!subtitle && (
        <Text style={{ fontSize: 12, opacity: 0.7, color: T.colors.text }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export default React.memo(HeaderTitle);
