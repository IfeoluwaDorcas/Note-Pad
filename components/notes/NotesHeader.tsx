import React from 'react';
import { View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import NotesToolbar from './NotesToolbar';

type Props = {
  title: string;
  total: number;
  scrollY?: SharedValue<number>;
};

export default function NotesHeader({ title, total, scrollY }: Props) {
  return (
    <View>
      <NotesToolbar variant="full" title={title} total={total} scrollY={scrollY} />
    </View>
  );
}
