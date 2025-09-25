import { useAppTheme } from '@/providers/ThemeProvider';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  Text as RNText,
  StyleSheet,
  TextProps,
  UIManager,
  View,
} from 'react-native';

export type Item = {
  key: string;
  label: string | React.ReactNode;
  onPress: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: Item[];
  anchorRef: React.RefObject<View | null>;
  topOffset?: number;
  width?: number;
};

export default function PopoverMenu({
  visible,
  onClose,
  items,
  anchorRef,
  topOffset = 8,
  width = 135,
}: Props) {
  const { theme } = useAppTheme();
  const c = theme.tokens.colors;

  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 80, right: 16 });
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    if (!visible) return;

    const placeMenu = () => {
      if (Platform.OS === 'web') {
        const el = anchorRef.current as unknown as { getBoundingClientRect?: () => DOMRect } | null;
        const rect = el?.getBoundingClientRect?.();
        if (!rect) return;

        const screenW =
          typeof window !== 'undefined' ? window.innerWidth : Dimensions.get('window').width;
        const right = Math.max(8, Math.round(screenW - rect.right));
        const top = Math.round(rect.bottom + topOffset);
        setPos({ top, right });
      } else {
        const node =
          (anchorRef.current as any)?._internalFiberInstanceHandleDEV?.stateNode ??
          (anchorRef.current as any);
        if (!node) return;

        UIManager.measureInWindow(node, (x, y, w, h) => {
          const screenW = Dimensions.get('window').width;
          const right = Math.max(8, Math.round(screenW - (x + w)));
          const top = Math.round(y + h + topOffset);
          setPos({ top, right });
        });
      }

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    };

    placeMenu();

    return () => {
      opacity.setValue(0);
      scale.setValue(0.98);
    };
  }, [visible]);

  if (!visible) return null;

  const isRNTextElement = (node: React.ReactNode): node is React.ReactElement<TextProps> =>
    React.isValidElement(node) && node.type === RNText;

  const renderLabel = (label: Item['label'], destructive?: boolean) => {
    const textColor = destructive ? c.accentMuted : c.text;

    if (typeof label === 'string') {
      return (
        <RNText style={[s.label, { color: textColor }]} numberOfLines={1}>
          {label}
        </RNText>
      );
    }
    if (isRNTextElement(label)) {
      return React.cloneElement(label, {
        style: [s.label, label.props?.style, { color: textColor }],
        numberOfLines: label.props?.numberOfLines ?? 1,
      });
    }

    return <View style={{ flexShrink: 1 }}>{label}</View>;
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View
        style={[
          s.menu,
          {
            top: pos.top,
            right: pos.right,
            minWidth: width,
            opacity,
            transform: [{ scale }],
            backgroundColor: c.bg,
          },
        ]}
      >

        {items.map((it, i) => (
          <Pressable
            key={it.key}
            onPress={() => {
              it.onPress();
              onClose();
            }}
            android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
            style={[
              s.row,
              i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
            ]}
          >
            {renderLabel(it.label, it.destructive)}
            {it.right ? <View style={s.right}>{it.right}</View> : null}
          </Pressable>
        ))}
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  menu: {
    position: 'absolute',
    borderRadius: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  arrow: {
    position: 'absolute',
    top: -6,
    right: 20,
    width: 12,
    height: 12,
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    minHeight: 35,
    paddingHorizontal: 14,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
  right: {
    marginLeft: 'auto',
  },
});
