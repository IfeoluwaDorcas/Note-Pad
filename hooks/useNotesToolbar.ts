import { useUIStore } from '@/src/state/uiStore';
import { useEffect, useRef, useState } from 'react';
import { Easing, Animated as RNSimpleAnimated, View } from 'react-native';
import {
  Extrapolation,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export type Mode = 'default' | 'recycle';

const ENTER = 120;
const EXIT = ENTER - 12;

type Params = {
  scrollY?: SharedValue<number>;
  mode?: Mode;
};

export type NotesToolbarController = ReturnType<typeof useNotesToolbar>;

export function useNotesToolbar({ scrollY, mode = 'default' }: Params) {
  // ----- global UI store
  const {
    sortBy,
    sortDir,
    setSortBy,
    toggleSortDir,
    view,
    setView,
    setSearchQuery,
  } = useUIStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const moreAnchorRef = useRef<View>(null);
  const filterAnchorRef = useRef<View>(null);

  const debTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debTimer.current) clearTimeout(debTimer.current);
    debTimer.current = setTimeout(() => setSearchQuery(query), 220);
    return () => {
      if (debTimer.current) clearTimeout(debTimer.current);
    };
  }, [query, setSearchQuery]);

  const searchingSV = useSharedValue(false);
  useEffect(() => {
    searchingSV.value = searchOpen;
  }, [searchOpen, searchingSV]);

  const fullProg = useRef(new RNSimpleAnimated.Value(0)).current;
  const stickyProg = useRef(new RNSimpleAnimated.Value(0)).current;

  const openSearch = () => {
    setSearchOpen(true);
    RNSimpleAnimated.timing(fullProg, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    RNSimpleAnimated.timing(stickyProg, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setSearchQuery('');
    RNSimpleAnimated.timing(fullProg, {
      toValue: 0,
      duration: 160,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
    RNSimpleAnimated.timing(stickyProg, {
      toValue: 0,
      duration: 160,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const [shouldHideFilters, setShouldHideFilters] = useState(false);
  const [compactVisible, setCompactVisible] = useState(false);
  const hiddenSV = useSharedValue(false);

  useAnimatedReaction(
    () => scrollY?.value ?? 0,
    (y) => {
      if (searchingSV.value) return;
      const nextHidden = y > ENTER ? true : y < EXIT ? false : hiddenSV.value;
      if (nextHidden !== hiddenSV.value) {
        hiddenSV.value = nextHidden;
        runOnJS(setShouldHideFilters)(nextHidden);
        runOnJS(setCompactVisible)(nextHidden);
      }
    },
    [scrollY]
  );

  const fullFadeStyle = useAnimatedStyle(() => {
  const y = scrollY?.value ?? 0;
  const p = interpolate(y, [0, ENTER + 10], [0, 1], Extrapolation.CLAMP);
  return { opacity: 1 - p, transform: [{ translateY: -8 * p }] };
}, [scrollY]);

const stickyFadeStyle = useAnimatedStyle(() => {
  const y = scrollY?.value ?? 0;
  const p = interpolate(y, [0, ENTER + 10], [0, 1], Extrapolation.CLAMP);
  return { opacity: p, transform: [{ translateY: -10 * (1 - p) }] };
}, [scrollY]);


  return {
    sortBy,
    sortDir,
    setSortBy,
    toggleSortDir,
    view,
    setView,
    query,
    setQuery,
    searchOpen,
    openSearch,
    closeSearch,
    filterOpen,
    setFilterOpen,
    moreOpen,
    setMoreOpen,
    viewOpen,
    setViewOpen,
    moreAnchorRef,
    filterAnchorRef,
    shouldHideFilters,
    compactVisible,
    fullProg,
    stickyProg,
    fullFadeStyle,
    stickyFadeStyle,
    mode,
  };
}
