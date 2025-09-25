import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (hex: string | null) => void;
  title?: string;
  swatches?: string[];
  themeColors: { card: string; text: string; border: string };
};

const DEFAULTS = ['#000000','#1F2937','#374151','#6B7280','#EF4444','#F59E0B','#10B981','#3B82F6','#8B5CF6','#EC4899','#F9FAFB','#FFFFFF'];

export default function ColorPickerModal({ visible, onClose, onPick, title='Choose color', swatches=DEFAULTS, themeColors }: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
        <ScrollView contentContainerStyle={styles.grid} horizontal>
          {swatches.map((c) => (
            <Pressable key={c} onPress={() => { onPick(c); onClose(); }} accessibilityLabel={`Pick ${c}`} hitSlop={8}>
              <View style={[styles.swatch, { backgroundColor: c, borderColor: themeColors.border }]} />
            </Pressable>
          ))}
          <Pressable onPress={() => { onPick(null); onClose(); }} accessibilityLabel="Clear color" hitSlop={8}>
            <View style={[styles.clear, { borderColor: themeColors.border }]}>
              <Text style={{ color: themeColors.text, fontSize: 12 }}>Clear</Text>
            </View>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000055' },
  sheet: { position: 'absolute', bottom: 24, left: 12, right: 12, borderRadius: 12, padding: 12, borderWidth: 1 },
  title: { fontWeight: '600', marginBottom: 8 },
  grid: { paddingVertical: 8, gap: 12, alignItems: 'center' },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 1 },
  clear: { width: 60, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
