import { useAppTheme } from '@/providers/ThemeProvider';
import { CheckCircle2, Circle } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  content?: string;
  color: string;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onLongPress?: () => void;
  onPress?: () => void;
  mode?: 'default' | 'recycle';
  daysLeft?: number;
};

export default function StickyCard({
  title,
  content,
  color,
  selectable = false,
  selected = false,
  onToggleSelect,
  onLongPress,
  onPress,
  mode = 'default',
  daysLeft,
}: Props) {
  const { theme } = useAppTheme();
  const T = theme.tokens;

  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={selectable ? onToggleSelect : onPress}
      style={({ pressed }) => [
        s.wrap,
        {
          backgroundColor: color,
          opacity: mode === 'recycle' ? 0.75 : pressed ? 0.92 : 1,
          borderRadius: T.radius,
        },
      ]}
    >
      {selectable && (
        <Pressable onPress={onToggleSelect} hitSlop={8} style={s.knob}>
          {selected ? (
            <CheckCircle2 size={18} color={T.colors.text} />
          ) : (
            <Circle size={18} color={T.colors.text} />
          )}
        </Pressable>
      )}

      <View style={s.body}>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={[s.title, { color: T.colors.text }]}
        >
          {title}
        </Text>

        {!!content && (
          <Text
            numberOfLines={6}
            ellipsizeMode="tail"
            style={[s.content, { color: T.colors.text, fontFamily: 'Inter' }]}
          >
            {content}
          </Text>
        )}
      </View>

      {mode === 'recycle' && typeof daysLeft === 'number' && (
        <View style={s.footer}>
          <Text style={[s.daysLeft, { color: T.colors.text, fontFamily: 'Inter' }]}>
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: {
    padding: 12,
    height: 120,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  knob: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 2,
  },
  body: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
    includeFontPadding: false,
    textAlignVertical: 'top',
  },
  content: {
    fontSize: 14,
    lineHeight: 19,
    flexShrink: 1,
    includeFontPadding: false,
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: 6,
  },
  daysLeft: {
    fontSize: 12,
    opacity: 0.7,
  },
});
