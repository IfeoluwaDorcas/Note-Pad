import { useAppTheme } from '@/providers/ThemeProvider';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  Animated as RNAnimated,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  count: number;
  label: string;
  actionText?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  dismissOnBackdrop?: boolean;
};

export default function ConfirmDialog({
  visible,
  count,
  label,
  actionText = 'will be moved to Recycle Bin',
  cancelLabel = 'Cancel',
  confirmLabel = 'Move to Recycle bin',
  onConfirm,
  onCancel,
  dismissOnBackdrop = true,
}: Props) {
  const { theme } = useAppTheme();
  const c = theme.tokens.colors;

  const [mounted, setMounted] = useState(visible);
  const backdrop = useRef(new RNAnimated.Value(0)).current;
  const translateY = useRef(new RNAnimated.Value(40)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      RNAnimated.parallel([
        RNAnimated.timing(backdrop, { toValue: 1, duration: 180, useNativeDriver: true }),
        RNAnimated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      RNAnimated.parallel([
        RNAnimated.timing(backdrop, { toValue: 0, duration: 160, useNativeDriver: true }),
        RNAnimated.timing(translateY, { toValue: 40, duration: 180, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;

  const message = `${count} ${label} ${actionText}`;

  return (
    <Modal
      presentationStyle="overFullScreen"
      animationType="none"
      transparent
      visible={mounted}
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable
        style={styles.backdrop}
        onPress={dismissOnBackdrop ? onCancel : undefined}
      >
        <RNAnimated.View
          pointerEvents="none"
          style={[styles.backdropFill, { opacity: backdrop }]}
        />
      </Pressable>

      <RNAnimated.View
        style={[
          styles.sheetWrap,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={[styles.sheetCard, { backgroundColor: c.card }]}>
          <Text style={[styles.sheetMsg, { color: c.text }]}>{message}</Text>

          <View style={styles.actionsRow}>
            <Pressable onPress={onCancel} style={[styles.actionBtn, { backgroundColor: c.card }]}>
              <Text style={[styles.cancelText, { color: c.text }]}>{cancelLabel}</Text>
            </Pressable>

            <View style={[styles.divider, { backgroundColor: c.border }]} />

            <Pressable onPress={onConfirm} style={[styles.actionBtn, { backgroundColor: c.card }]}>
              <Text style={[styles.confirmText, { color: c.accent }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </RNAnimated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  backdropFill: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },

  sheetWrap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    padding: 12,
  },
  sheetCard: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 12 },
    }),
  },
  sheetMsg: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  divider: {
    width: 1,
    height: 22,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  confirmText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
