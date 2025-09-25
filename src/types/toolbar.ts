import { SharedValue } from "react-native-reanimated";

export type NotesToolbarProps = {
  scrollY: SharedValue<number>;
  isSearching: boolean;
  onToggleSearch: () => void;
};
