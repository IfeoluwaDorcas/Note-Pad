import { useAppTheme } from '@/providers/ThemeProvider';
import {
  addDays,
  addHours,
  daysInMonth,
  friendlyDate,
  toDDMMYYYY,
  toHHmm,
  validHHMM,
} from "@/src/utils/dates";

import { Portal } from "@gorhom/portal";
import { ChevronDown, ChevronUp, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import type { ListRenderItem } from "react-native";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export type ReminderPayload = {
  title: string;
  place?: string;
  remindAt: string;
  repeat?: "none" | "daily";
};

type Props = {
  visible: boolean;
  mode?: "create" | "edit";
  initial?: Partial<{
    title: string;
    place?: string;
    timeHHmm: string;
    remindAt: string;
    repeat?: "none" | "daily";
  }>;
  onClose: () => void;
  onCreate?: (p: ReminderPayload) => void;
  onUpdate?: (p: ReminderPayload) => void;
  confirmLabel?: string;
};

const ITEM_HEIGHT = 36;

type NumberWheelProps = {
  range: number[];
  value: number;
  onChange: (v: number) => void;
  textColor: string;
  fadedColor: string;
  width?: number;
};

const NumberWheel: React.FC<NumberWheelProps> = ({
  range,
  value,
  onChange,
  textColor,
  fadedColor,
  width = 72,
}) => {
  const listRef = React.useRef<FlatList<number>>(null);
  const containerPad = (112 - ITEM_HEIGHT) / 2;

  useEffect(() => {
    const idx = range.indexOf(value);
    if (idx >= 0 && listRef.current) {
      listRef.current.scrollToOffset({
        offset: idx * ITEM_HEIGHT,
        animated: true,
      });
    }
  }, [value, range]);

  const onEnd: React.ComponentProps<typeof FlatList>["onMomentumScrollEnd"] = (
    e
  ) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clampedIdx = Math.max(0, Math.min(idx, range.length - 1));
    onChange(range[clampedIdx]);
  };

  const renderItem: ListRenderItem<number> = ({ item }) => {
    const isSelected = item === value;
    return (
      <View
        style={{
          height: ITEM_HEIGHT,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: isSelected ? 44 : 22,
            fontWeight: (isSelected ? "800" : "400") as any,
            color: isSelected ? textColor : fadedColor,
            opacity: isSelected ? 1 : 0.45,
            includeFontPadding: false,
          }}
        >
          {String(item).padStart(2, "0")}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={{
        height: 112,
        width,
        alignItems: "stretch",
        justifyContent: "center",
      }}
    >
      <FlatList
        ref={listRef}
        data={range}
        keyExtractor={(n) => String(n)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onMomentumScrollEnd={onEnd}
        contentContainerStyle={{
          paddingTop: containerPad,
          paddingBottom: containerPad,
        }}
        renderItem={renderItem}
      />
    </View>
  );
};

export default function CreateReminderDialog({
  visible,
  mode = "create",
  initial,
  onClose,
  onCreate,
  onUpdate,
  confirmLabel,
}: Props) {
  const { theme } = useAppTheme();
  const T = theme.tokens;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [place, setPlace] = useState(initial?.place ?? "");
  const [time, setTime] = useState(initial?.timeHHmm ?? "");

  const now = new Date();
  const [pickY, setPickY] = useState(now.getFullYear());
  const [pickMo, setPickMo] = useState(now.getMonth() + 1);
  const [pickD, setPickD] = useState(now.getDate());
  const [dateText, setDateText] = useState(
    toDDMMYYYY(now.getFullYear(), now.getMonth() + 1, now.getDate())
  );

  const [showDateSheet, setShowDateSheet] = useState(false);
  const [showTimeSheet, setShowTimeSheet] = useState(false);
  const [pickH, setPickH] = useState(12);
  const [pickM, setPickM] = useState(0);

  const [repeatDaily, setRepeatDaily] = useState(initial?.repeat === "daily");

  useEffect(() => {
    const dim = daysInMonth(pickY, pickMo);
    if (pickD > dim) setPickD(dim);
  }, [pickY, pickMo, pickD]);

  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? "");
    setPlace(initial?.place ?? "");
    setRepeatDaily(initial?.repeat === "daily");

    const base = new Date();

    if (initial?.remindAt) {
      const d = new Date(initial.remindAt);
      setPickY(d.getFullYear());
      setPickMo(d.getMonth() + 1);
      setPickD(d.getDate());
      setDateText(toDDMMYYYY(d.getFullYear(), d.getMonth() + 1, d.getDate()));
      const hh = d.getHours(),
        mm = d.getMinutes();
      setPickH(hh);
      setPickM(mm);
      setTime(toHHmm(hh, mm));
    } else {
      const fromInitialTime =
        initial?.timeHHmm ??
        (initial?.remindAt
          ? new Date(initial.remindAt).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "");
      if (fromInitialTime && validHHMM(fromInitialTime)) {
        const [h, m] = fromInitialTime.split(":").map(Number);
        setPickH(h);
        setPickM(m);
        setTime(fromInitialTime);
      } else {
        setPickH(base.getHours());
        setPickM(base.getMinutes());
        setTime(toHHmm(base.getHours(), base.getMinutes()));
      }
      setPickY(base.getFullYear());
      setPickMo(base.getMonth() + 1);
      setPickD(base.getDate());
      setDateText(
        toDDMMYYYY(base.getFullYear(), base.getMonth() + 1, base.getDate())
      );
    }
  }, [
    visible,
    initial?.title,
    initial?.place,
    initial?.timeHHmm,
    initial?.remindAt,
    initial?.repeat,
  ]);

  const isValid = useMemo(
    () => !!title.trim() && validHHMM(time) && !!dateText,
    [title, time, dateText]
  );

  const openDateSheet = () => setShowDateSheet(true);

  const openTimeSheet = () => {
    const base = new Date();
    if (validHHMM(time)) {
      const [h, m] = time.split(":").map(Number);
      setPickH(h);
      setPickM(m);
    } else {
      setPickH(base.getHours());
      setPickM(base.getMinutes());
    }
    setShowTimeSheet(true);
  };

  const incH = () => setPickH((h) => (h + 1) % 24);
  const decH = () => setPickH((h) => (h + 23) % 24);
  const incM = () => setPickM((m) => (m + 1) % 60);
  const decM = () => setPickM((m) => (m + 59) % 60);

  const applyDate = () => {
    setDateText(toDDMMYYYY(pickY, pickMo, pickD));
    setShowDateSheet(false);
  };

  const applyTime = () => {
    setTime(toHHmm(pickH, pickM));
    setShowTimeSheet(false);
  };

  const setPresetTime = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    setPickH(h);
    setPickM(m);
  };

  const setPresetDate = (deltaDays: number) => {
    const d = addDays(new Date(), deltaDays);
    setPickY(d.getFullYear());
    setPickMo(d.getMonth() + 1);
    setPickD(d.getDate());
    setDateText(toDDMMYYYY(d.getFullYear(), d.getMonth() + 1, d.getDate()));
  };

  const handleConfirm = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !validHHMM(time)) return;
    const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
    const dt = new Date();
    dt.setFullYear(pickY, pickMo - 1, pickD);
    dt.setHours(hh, mm, 0, 0);
    const remindAt = dt.toISOString();
    const payload: ReminderPayload = {
      title: trimmedTitle,
      place: place?.trim() || undefined,
      remindAt,
      repeat: repeatDaily ? "daily" : "none",
    };
    mode === "edit" ? onUpdate?.(payload) : onCreate?.(payload);
    onClose();
  };

  const btnText = confirmLabel ?? (mode === "edit" ? "Save" : "Create");
  if (!visible) return null;

  const years = Array.from({ length: 7 }, (_, i) => now.getFullYear() + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from(
    { length: daysInMonth(pickY, pickMo) },
    (_, i) => i + 1
  );

  const dateLabel = friendlyDate(pickY, pickMo, pickD);

  return (
    <Portal>
      <Pressable onPress={onClose} style={s.backdrop} />

      <View pointerEvents="box-none" style={s.centerLayer}>
        <KeyboardAvoidingView
          enabled={Platform.OS === "ios"}
          behavior="padding"
          style={s.kav}
        >
          <View
            onStartShouldSetResponder={() => true}
            style={[
              s.card,
              { backgroundColor: T.colors.bg, borderRadius: T.radius },
            ]}
          >
            <View style={s.header}>
              <Text style={[s.h, { color: T.colors.text }]}>
                {mode === "edit" ? "Edit Reminder" : "New Reminder"}
              </Text>
              <Pressable hitSlop={10} onPress={onClose}>
                <X size={20} color={T.colors.text} />
              </Pressable>
            </View>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor={T.colors.placeholder}
              maxLength={75}
              style={[
                s.input,
                s.inputTitle,
                {
                  borderRadius: T.radius,
                  color: T.colors.text,
                  backgroundColor: T.colors.card,
                },
              ]}
              autoFocus
              returnKeyType="next"
            />

            <Pressable
              onPress={openTimeSheet}
              style={[
                s.input,
                s.pickerLike,
                { borderRadius: T.radius, backgroundColor: T.colors.card },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Pick time"
            >
              <Text
                style={[
                  s.pickerText,
                  { color: time ? T.colors.text : T.colors.placeholder },
                ]}
              >
                {time || "Time (HH:mm)"}
              </Text>
            </Pressable>

            <Pressable
              onPress={openDateSheet}
              style={[
                s.input,
                s.pickerLike,
                { borderRadius: T.radius, backgroundColor: T.colors.card },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Pick date"
            >
              <Text
                style={[
                  s.pickerText,
                  { color: dateText ? T.colors.text : T.colors.placeholder },
                ]}
              >
                {dateText ? dateLabel : "Date (dd/mm/yyyy)"}
              </Text>
            </Pressable>

            <TextInput
              value={place}
              onChangeText={setPlace}
              placeholder="Place (optional)"
              placeholderTextColor={T.colors.placeholder}
              style={[
                s.input,
                {
                  borderRadius: T.radius,
                  color: T.colors.text,
                  backgroundColor: T.colors.card,
                },
              ]}
              returnKeyType="done"
              onSubmitEditing={handleConfirm}
            />

            <View style={s.actions}>
              <Pressable onPress={onClose} style={[s.btn, s.ghost]}>
                <Text style={[s.btnText, { color: T.colors.text }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                disabled={!isValid}
                style={({ pressed }) => [
                  s.btn,
                  {
                    backgroundColor: !isValid
                      ? "rgba(0,0,0,0.15)"
                      : T.colors.accent,
                    opacity: pressed ? 0.95 : 1,
                  },
                ]}
              >
                <Text style={[s.btnText, { color: "#fff" }]}>{btnText}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* DATE SHEET */}
      {showDateSheet && (
        <>
          <Pressable
            onPress={() => setShowDateSheet(false)}
            style={s.backdrop}
          />
          <View pointerEvents="box-none" style={s.centerLayer}>
            <View
              style={[
                s.sheet,
                { backgroundColor: T.colors.bg, borderRadius: T.radius },
              ]}
            >
              <View style={s.sheetHeader}>
                <Pressable onPress={() => setShowDateSheet(false)}>
                  <Text style={{ color: T.colors.text }}>Cancel</Text>
                </Pressable>
                <Text style={[s.h, { color: T.colors.text }]}>Date</Text>
                <Pressable onPress={applyDate}>
                  <Text style={{ color: T.colors.accent, fontWeight: "700" }}>
                    Set
                  </Text>
                </Pressable>
              </View>

              <View style={[s.timeRow, { gap: 6 }]}>
                <View style={s.col}>
                  <Pressable
                    onPress={() => setPickY((y) => y + 1)}
                    hitSlop={8}
                    style={s.chev}
                  >
                    <ChevronUp size={20} color={T.colors.text} />
                  </Pressable>
                  <NumberWheel
                    range={years}
                    value={pickY}
                    onChange={setPickY}
                    textColor={T.colors.text}
                    fadedColor={T.colors.textMuted}
                    width={104}
                  />
                  <Pressable
                    onPress={() => setPickY((y) => Math.max(years[0], y - 1))}
                    hitSlop={8}
                    style={s.chev}
                  >
                    <ChevronDown size={20} color={T.colors.text} />
                  </Pressable>
                </View>

                <Text style={[s.sep, { color: T.colors.text }]}>-</Text>

                <View style={s.col}>
                  <Pressable
                    onPress={() => setPickMo((m) => (m % 12) + 1)}
                    hitSlop={8}
                    style={s.chev}
                  >
                    <ChevronUp size={20} color={T.colors.text} />
                  </Pressable>
                  <NumberWheel
                    range={months}
                    value={pickMo}
                    onChange={setPickMo}
                    textColor={T.colors.text}
                    fadedColor={T.colors.textMuted}
                    width={84}
                  />
                  <Pressable
                    onPress={() => setPickMo((m) => ((m + 10) % 12) + 1)}
                    hitSlop={8}
                    style={s.chev}
                  >
                    <ChevronDown size={20} color={T.colors.text} />
                  </Pressable>
                </View>

                <Text style={[s.sep, { color: T.colors.text }]}>-</Text>

                <View style={s.col}>
                  <Pressable
                    onPress={() => setPickD((d) => (d % days.length) + 1)}
                    hitSlop={8}
                    style={s.chev}
                  >
                    <ChevronUp size={20} color={T.colors.text} />
                  </Pressable>
                  <NumberWheel
                    range={days}
                    value={pickD}
                    onChange={setPickD}
                    textColor={T.colors.text}
                    fadedColor={T.colors.textMuted}
                    width={84}
                  />
                  <Pressable
                    onPress={() =>
                      setPickD((d) => ((d + days.length - 2) % days.length) + 1)
                    }
                    hitSlop={8}
                    style={s.chev}
                  >
                    <ChevronDown size={20} color={T.colors.text} />
                  </Pressable>
                </View>
              </View>

              {/* ✅ Presets with Everyday toggle */}
              <View style={s.presetRow}>
                <Pressable
                  onPress={() => setPresetDate(0)}
                  style={[s.presetBtn, { backgroundColor: T.colors.card }]}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[s.presetText, { color: T.colors.text }]}
                  >
                    Today
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setPresetDate(1)}
                  style={[s.presetBtn, { backgroundColor: T.colors.card }]}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[s.presetText, { color: T.colors.text }]}
                  >
                    Tomorrow
                  </Text>
                </Pressable>

                <View style={s.chipsRow}>
                  <Pressable
                    onPress={() => setPresetDate(7)}
                    style={[s.presetChip, { backgroundColor: T.colors.card }]}
                  >
                    <Text style={{ color: T.colors.text }}>1 week</Text>
                  </Pressable>

                  {/* Everyday toggle chip */}
                  <Pressable
                    onPress={() => setRepeatDaily((v) => !v)}
                    style={[
                      s.presetChip,
                      {
                        backgroundColor: repeatDaily
                          ? T.colors.accent
                          : T.colors.card,
                        borderWidth: repeatDaily ? 0 : StyleSheet.hairlineWidth,
                        borderColor: T.colors.textMuted,
                      },
                    ]}
                  >
                    <Text
                      style={{ color: repeatDaily ? "#fff" : T.colors.text }}
                    >
                      Everyday
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </>
      )}

      {/* TIME SHEET */}
      {showTimeSheet && (
        <>
          <Pressable
            onPress={() => setShowTimeSheet(false)}
            style={s.backdrop}
          />
          <View pointerEvents="box-none" style={s.centerLayer}>
            <View
              style={[
                s.sheet,
                { backgroundColor: T.colors.bg, borderRadius: T.radius },
              ]}
            >
              <View style={s.sheetHeader}>
                <Pressable onPress={() => setShowTimeSheet(false)}>
                  <Text style={{ color: T.colors.text }}>Cancel</Text>
                </Pressable>
                <Text style={[s.h, { color: T.colors.text }]}>Time</Text>
                <Pressable onPress={applyTime}>
                  <Text style={{ color: T.colors.accent, fontWeight: "700" }}>
                    Set
                  </Text>
                </Pressable>
              </View>

              <View style={s.timeRow}>
                <View style={s.col}>
                  <Pressable onPress={incH} hitSlop={8} style={s.chev}>
                    <ChevronUp size={20} color={T.colors.text} />
                  </Pressable>
                  <NumberWheel
                    range={Array.from({ length: 24 }, (_, i) => i)}
                    value={pickH}
                    onChange={setPickH}
                    textColor={T.colors.text}
                    fadedColor={T.colors.textMuted}
                    width={84}
                  />
                  <Pressable onPress={decH} hitSlop={8} style={s.chev}>
                    <ChevronDown size={20} color={T.colors.text} />
                  </Pressable>
                </View>

                <Text style={[s.colon, { color: T.colors.text }]}>:</Text>

                <View style={s.col}>
                  <Pressable onPress={incM} hitSlop={8} style={s.chev}>
                    <ChevronUp size={20} color={T.colors.text} />
                  </Pressable>
                  <NumberWheel
                    range={Array.from({ length: 60 }, (_, i) => i)}
                    value={pickM}
                    onChange={setPickM}
                    textColor={T.colors.text}
                    fadedColor={T.colors.textMuted}
                    width={84}
                  />
                  <Pressable onPress={decM} hitSlop={8} style={s.chev}>
                    <ChevronDown size={20} color={T.colors.text} />
                  </Pressable>
                </View>
              </View>

              <View style={s.presetRow}>
                <Pressable
                  onPress={() => {
                    const d = addHours(new Date(), 1);
                    setPickH(d.getHours());
                    setPickM(d.getMinutes());
                  }}
                  style={[s.presetBtn, { backgroundColor: T.colors.card }]}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[s.presetText, { color: T.colors.text }]}
                  >
                    1 hour from now
                  </Text>
                </Pressable>

                <View style={s.chipsRow}>
                  {["07:00", "15:00", "22:00"].map((preset) => (
                    <Pressable
                      key={preset}
                      onPress={() => setPresetTime(preset)}
                      style={[s.presetChip, { backgroundColor: T.colors.card }]}
                    >
                      <Text style={{ color: T.colors.text }}>{preset}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </Portal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  centerLayer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  kav: { width: '100%', alignItems: 'center' },
  card: {
    width: '90%',
    minWidth: 300,
    maxWidth: 520,
    padding: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 0, paddingHorizontal: 14, paddingVertical: 10, marginTop: 14 },
  inputTitle: { fontWeight: '700' },
  pickerLike: { justifyContent: 'center' },
  pickerText: { fontSize: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 14, marginTop: 24 },
  btn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14 },
  btnText: { fontWeight: '700' },
  ghost: { backgroundColor: 'transparent' },
  sheet: {
    width: '90%',
    maxWidth: 520,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  col: { alignItems: 'center' },
  chev: { paddingVertical: 8 },
  colon: { fontSize: 36, fontWeight: '800', marginHorizontal: 8, marginTop: -6 },
  sep: { fontSize: 28, fontWeight: '800', marginHorizontal: 4, marginTop: -2 },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingTop: 6,
    flexWrap: 'wrap',
  },
  presetBtn: {
    flexShrink: 1,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    alignSelf: 'center',
  },
  presetText: {
    includeFontPadding: false,
    fontSize: 14,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
    flexShrink: 0,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    flexShrink: 0,
  },
});
