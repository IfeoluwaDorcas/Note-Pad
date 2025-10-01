declare module "react-native-pell-rich-editor" {
  import * as React from "react";
  import { StyleProp, ViewStyle } from "react-native";

  export interface RichEditorProps {
    initialContentHTML?: string;
    placeholder?: string;
    editorStyle?: any;
    onChange?: (html: string) => void;
    style?: StyleProp<ViewStyle>;
    useContainer?: boolean;
    androidLayerType?: "none" | "software" | "hardware";
  }

  export class RichEditor extends React.Component<RichEditorProps> {
    prepareInsert(): void;
    focusContentEditor(): void;
    commandDOM(js: string): void;
  }

  export interface RichToolbarProps {
    editor: React.RefObject<RichEditor | null> | (() => RichEditor | null);
    actions?: string[];
    iconMap?: Record<
      string,
      React.ReactNode | ((props: { tintColor?: string }) => React.ReactNode)
    >;
    style?: StyleProp<ViewStyle>;
    iconTint?: string;
    selectedIconTint?: string;
    disabledIconTint?: string;
    onPress?: (action: string) => void;
  }

  export class RichToolbar extends React.Component<RichToolbarProps> {}

  export const actions: {
    insertBulletsList: string;
    setBold: string;
    setItalic: string;
    setUnderline: string;
    alignLeft: string;
    alignCenter: string;
    alignRight: string;
    alignFull: string;
    undo: string;
    redo: string;
  };
}
