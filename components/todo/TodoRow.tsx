import { useAppTheme } from '@/providers/ThemeProvider';
import { CheckCircle2, Circle, GripVertical } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  completed?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onToggleDone?: () => void;
  onLongPress?: () => void;
  onPress?: () => void;
  mode?: 'default' | 'recycle';
  daysLeft?: number;

  reorderEnabled?: boolean;
  onDrag?: () => void;
  dragging?: boolean;
};

export default function TodoRow({
  title,
  completed = false,
  selectable = false,
  selected = false,
  onToggleSelect,
  onToggleDone,
  onLongPress,
  onPress,
  mode = 'default',
  daysLeft,
  reorderEnabled = false,
  onDrag,
  dragging = false,
}: Props) {
  const { theme } = useAppTheme();
  const T = theme.tokens;

  const isRecycle = mode === 'recycle';

  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={selectable ? onToggleSelect : onPress}
      style={({ pressed }) => [
        s.wrap,
        {
          backgroundColor: T.colors.bg,
          borderRadius: T.radius,
          opacity: pressed ? 0.95 : 1,
          transform: dragging ? [{ scale: 0.98 }] : undefined,
        },
      ]}
    >
      <Pressable
        onPress={isRecycle ? undefined : onToggleDone}
        hitSlop={10}
        style={[s.knob, isRecycle && { opacity: 0.5 }]}
      >
        {completed ? <CheckCircle2 size={22} color={T.colors.accent} /> : <Circle size={22} color={T.colors.text} />}
      </Pressable>

      <View style={s.body}>
        <Text
          numberOfLines={2}
          style={[
            s.title,
            { color: T.colors.text, textDecorationLine: completed ? 'line-through' : 'none', opacity: completed ? 0.6 : 1 },
          ]}
        >
          {title}
        </Text>

        {isRecycle && typeof daysLeft === 'number' && (
          <Text style={[s.daysLeft, { color: T.colors.textMuted }]}>
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
          </Text>
        )}
      </View>

      {selectable ? (
        <Pressable onPress={onToggleSelect} hitSlop={8} style={s.selectKnob}>
          {selected ? <CheckCircle2 size={18} color={T.colors.text} /> : <Circle size={18} color={T.colors.text} />}
        </Pressable>
      ) : reorderEnabled ? (
        <Pressable onLongPress={onDrag} hitSlop={8} style={s.handle} accessibilityLabel="Reorder">
          <GripVertical size={18} color={T.colors.textMuted} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 15, paddingRight: 18, paddingVertical: 15, },

  knob: { paddingRight: 10, justifyContent: 'center' },
  knobTight: { paddingTop: 0, alignSelf: 'center' },

  selectKnob: { paddingLeft: 10, paddingTop: 2 },
  selectKnobTight: { paddingTop: 0, alignSelf: 'center' },
  handle: { paddingLeft: 10, paddingTop: 2 },

  body: { flex: 1, justifyContent: 'flex-start' },
  bodyTight: { justifyContent: 'center' },

  title: { fontSize: 16, fontWeight: '400', includeFontPadding: false },
  daysLeft: { fontSize: 12, marginTop: 6 },
});
