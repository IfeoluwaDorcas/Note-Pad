import { useAppTheme } from '@/providers/ThemeProvider';
import { CalendarClock, CheckCircle2, Circle } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  remindAtISO: string;
  completed?: boolean;
  completedAtISO?: string;

  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onToggleDone?: () => void;
  onLongPress?: () => void;
  onPress?: () => void;

  mode?: 'default' | 'recycle';
};

const fmt = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date}, ${time}`;
};

const hhmm = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
};

export default function ReminderRow({
  title,
  remindAtISO,
  completed = false,
  completedAtISO,
  selectable = false,
  selected = false,
  onToggleSelect,
  onToggleDone,
  onLongPress,
  onPress,
  mode = 'default',
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
        { backgroundColor: T.colors.bg, borderRadius: T.radius, opacity: pressed ? 0.95 : 1 },
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
          style={[s.title, { color: T.colors.text, textDecorationLine: completed ? 'line-through' : 'none', opacity: completed ? 0.6 : 1 }]}
        >
          {title}
        </Text>

        <View style={s.metaRow}>
          <CalendarClock size={14} color={T.colors.textMuted} />
          <Text style={[s.meta, { color: T.colors.textMuted }]}>
            {fmt(remindAtISO)}
            {completedAtISO ? `  •  Completed: ${hhmm(completedAtISO)}` : ''}
          </Text>
        </View>
      </View>

      {selectable ? (
        <Pressable onPress={onToggleSelect} hitSlop={8} style={s.selectKnob}>
          {selected ? <CheckCircle2 size={18} color={T.colors.text} /> : <Circle size={18} color={T.colors.text} />}
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 15, paddingRight: 18, paddingVertical: 15 },
  knob: { paddingRight: 10, justifyContent: 'center' },
  selectKnob: { paddingLeft: 10, paddingTop: 2 },
  body: { flex: 1, justifyContent: 'flex-start' },
  title: { fontSize: 16, fontWeight: '500', includeFontPadding: false },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  meta: { fontSize: 12 },
});
