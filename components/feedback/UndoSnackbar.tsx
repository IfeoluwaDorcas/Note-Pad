import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  message: string;
  actionLabel?: string;
  durationMs?: number;
  onAction?: () => void;
  onHide?: () => void;
};

export default function UndoSnackbar({
  visible, message, actionLabel = 'UNDO', durationMs = 3500, onAction, onHide,
}: Props) {
  const y = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(y, { toValue: 0, duration: 180, useNativeDriver: true }).start();
      const t = setTimeout(() => onHide?.(), durationMs);
      return () => clearTimeout(t);
    } else {
      Animated.timing(y, { toValue: 80, duration: 160, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[s.wrap, { transform: [{ translateY: y }] }]}>
      <View style={s.snack}>
        <Text style={s.text} numberOfLines={2}>{message}</Text>
        {!!onAction && (
          <Pressable onPress={onAction} style={s.btn}>
            <Text style={s.btnText}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
const s = StyleSheet.create({
  wrap:{ position:'absolute', left:12, right:12, bottom:12 },
  snack:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:14, paddingVertical:10, borderRadius:12, backgroundColor:'#1B1B1B' },
  text:{ color:'#fff', flex:1, marginRight:12 },
  btn:{ paddingHorizontal:8, paddingVertical:6, borderRadius:8 },
  btnText:{ color:'#BFA15A', fontWeight:'700' },
});
