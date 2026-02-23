import PopoverMenu from "@/components/common/PopoverMenu";
import HeaderTitle from "@/components/notes/HeaderTitle";
import {
  NotesToolbarController,
  useNotesToolbar,
} from "@/hooks/useNotesToolbar";
import { useAppTheme } from "@/providers/ThemeProvider";
import { countLabel } from "@/src/utils/plural";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Menu as Hamburger,
  MoreVertical,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react-native";
import React from "react";
import {
  Platform,
  Pressable,
  Animated as RNSimpleAnimated,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SharedValue } from "react-native-reanimated";
import Animated from "react-native-reanimated";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Variant = "full" | "sticky";
type Mode = "default" | "recycle";

type Props = {
  variant: Variant;
  title: string;
  total?: number;
  noun?: string;
  scrollY?: SharedValue<number>;
  onRequestEdit?: () => void;
  selectionMode?: boolean;
  allSelected?: boolean;
  onToggleSelectAll?: () => void;
  mode?: Mode;
  onEmptyBin?: () => void;
  controller?: NotesToolbarController;
  enableViewMenu?: boolean;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showMenu?: boolean;
  showFilters?: boolean;
};

export default function NotesToolbar(props: Props) {
  const {
    variant,
    title,
    total,
    noun,
    scrollY,
    onRequestEdit,
    selectionMode = false,
    allSelected = false,
    onToggleSelectAll,
    mode = "default",
    onEmptyBin,
    controller,
    enableViewMenu = true,
    searchPlaceholder = "Search notes",
    showSearch = true,
    showMenu = true,
    showFilters = true,
  } = props;

  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const T = theme.tokens;
  const localController = useNotesToolbar({ scrollY, mode });
  const t = controller ?? localController;

  const MoreMenus = showMenu ? (
    <>
      <View
        ref={t.moreAnchorRef}
        collapsable={false}
        style={styles.edgeAlignFixRight}
      >
        {!selectionMode && (
          <IconBtn onPress={() => t.setMoreOpen(true)}>
            <MoreVertical size={20} color={T.colors.text} />
          </IconBtn>
        )}
      </View>

      <PopoverMenu
        visible={t.moreOpen}
        onClose={() => t.setMoreOpen(false)}
        anchorRef={t.moreAnchorRef}
        items={
          mode === "recycle"
            ? [
                {
                  key: "edit",
                  label: "Edit",
                  onPress: () => {
                    t.setMoreOpen(false);
                    onRequestEdit?.();
                  },
                },
                {
                  key: "empty",
                  label: "Empty bin",
                  onPress: () => onEmptyBin?.(),
                },
              ]
            : [
                {
                  key: "edit",
                  label: "Edit",
                  onPress: () => {
                    t.setMoreOpen(false);
                    onRequestEdit?.();
                  },
                },
                ...(enableViewMenu
                  ? [
                      {
                        key: "view",
                        label: "View",
                        onPress: () => {
                          t.setMoreOpen(false);
                          t.setViewOpen(true);
                        },
                      },
                    ]
                  : []),
              ]
        }
      />

      {mode !== "recycle" && enableViewMenu && (
        <PopoverMenu
          visible={t.viewOpen}
          onClose={() => t.setViewOpen(false)}
          anchorRef={t.moreAnchorRef}
          items={[
            {
              key: "gridS",
              label: radio("Grid (small)", t.view === "gridS"),
              onPress: () => t.setView("gridS"),
            },
            {
              key: "gridM",
              label: radio("Grid (medium)", t.view === "gridM"),
              onPress: () => t.setView("gridM"),
            },
            {
              key: "gridL",
              label: radio("Grid (large)", t.view === "gridL"),
              onPress: () => t.setView("gridL"),
            },
          ]}
        />
      )}
    </>
  ) : null;

  if (variant === "sticky") {
    return (
      <Animated.View
        style={[
          styles.stickyWrap,
          t.stickyFadeStyle,
          { backgroundColor: T.colors.bg, top: insets.top },
        ]}
        pointerEvents={
          t.searchOpen ? "auto" : t.compactVisible ? "auto" : "none"
        }
      >
        <View style={styles.row1}>
          {selectionMode ? (
            <Pressable
              onPress={onToggleSelectAll}
              style={styles.allToggle}
              hitSlop={8}
            >
              {allSelected ? (
                <CheckCircle2 size={20} color={T.colors.text} />
              ) : (
                <Circle size={20} color={T.colors.text} />
              )}
              <Text style={[styles.allLabel, { color: T.colors.text }]}>
                All
              </Text>
            </Pressable>
          ) : (
            <IconBtn onPress={() => nav.openDrawer?.()}>
              <Hamburger size={22} color={T.colors.text} />
            </IconBtn>
          )}

          <View style={styles.stickyCenter}>
            {(!showSearch || !t.searchOpen) && (
              <Text
                numberOfLines={1}
                style={[styles.stickyTitleLeft, { color: T.colors.text }]}
              >
                {title}
              </Text>
            )}

            {showSearch && (
              <RNSimpleAnimated.View
                pointerEvents={t.searchOpen ? "auto" : "none"}
                style={[
                  styles.stickySearchBarInline,
                  {
                    opacity: t.stickyProg,
                    transform: [{ scaleX: t.stickyProg }],
                    backgroundColor: T.colors.card,
                  },
                ]}
              >
                <TextInput
                  value={t.query}
                  onChangeText={t.setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={T.colors.placeholder}
                  autoFocus={t.searchOpen}
                  style={[
                    styles.searchInput,
                    webNoOutline,
                    { color: T.colors.text },
                  ]}
                  returnKeyType="search"
                  underlineColorAndroid="transparent"
                  selectionColor={T.colors.text}
                />
              </RNSimpleAnimated.View>
            )}
          </View>

          {(showSearch || showMenu) && (
            <View style={styles.rightCluster}>
              {showSearch &&
                (!t.searchOpen ? (
                  <IconBtn onPress={t.openSearch}>
                    <Search size={20} color={T.colors.text} />
                  </IconBtn>
                ) : (
                  <IconBtn onPress={t.closeSearch}>
                    <X size={18} color={T.colors.text} />
                  </IconBtn>
                ))}
              {MoreMenus}
            </View>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <View>
      <Animated.View style={[styles.fullWrap, t.fullFadeStyle]}>
        <View style={styles.center}>
          <HeaderTitle
            title={title}
            noun={noun ?? "note"}
            subtitle={
              typeof total === "number" && typeof noun === "string"
                ? countLabel(total, noun)
                : undefined
            }
          />
        </View>

        <View style={styles.row1}>
          {selectionMode ? (
            <Pressable
              onPress={onToggleSelectAll}
              style={[styles.allToggle, styles.edgeAlignFixLeft]}
              hitSlop={8}
            >
              {allSelected ? (
                <CheckCircle2 size={20} color={T.colors.text} />
              ) : (
                <Circle size={20} color={T.colors.text} />
              )}
              <Text style={[styles.allLabel, { color: T.colors.text }]}>
                All
              </Text>
            </Pressable>
          ) : (
            <IconBtn
              onPress={() => nav.openDrawer?.()}
              style={styles.edgeAlignFixLeft}
            >
              <Hamburger size={22} color={T.colors.text} />
            </IconBtn>
          )}

          {showSearch ? (
            <View style={styles.centerSearch}>
              {!t.searchOpen ? (
                <IconBtn onPress={t.openSearch} style={styles.searchAnchor}>
                  <Search size={20} color={T.colors.text} />
                </IconBtn>
              ) : (
                <IconBtn onPress={t.closeSearch} style={styles.searchAnchor}>
                  <X size={18} color={T.colors.text} />
                </IconBtn>
              )}

              <RNSimpleAnimated.View
                pointerEvents={t.searchOpen ? "auto" : "none"}
                style={[
                  styles.searchBar,
                  {
                    opacity: t.fullProg,
                    transform: [{ scaleX: t.fullProg }],
                    backgroundColor: T.colors.accentMuted,
                  },
                ]}
              >
                <TextInput
                  value={t.query}
                  onChangeText={t.setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={T.colors.placeholder}
                  autoFocus={t.searchOpen}
                  style={[
                    styles.searchInput,
                    webNoOutline,
                    { color: T.colors.text },
                  ]}
                  returnKeyType="search"
                  underlineColorAndroid="transparent"
                  selectionColor={T.colors.text}
                />
              </RNSimpleAnimated.View>
            </View>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {showMenu && (
            <View style={styles.edgeAlignFixRight}>{MoreMenus}</View>
          )}
        </View>

        {mode !== "recycle" && showFilters && !t.shouldHideFilters && (
          <View className="row2" style={styles.row2}>
            <View
              ref={t.filterAnchorRef}
              collapsable={false}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <IconBtn onPress={() => t.setFilterOpen(true)}>
                <SlidersHorizontal size={14} color={T.colors.text} />
              </IconBtn>

              <Pressable onPress={() => t.setFilterOpen(true)}>
                <Text
                  style={{
                    fontSize: 14,
                    marginRight: 10,
                    color: T.colors.text,
                  }}
                >
                  {t.sortBy === "dateCreated"
                    ? "Date Created"
                    : t.sortBy === "dateModified"
                      ? "Date Modified"
                      : "Title"}
                </Text>
              </Pressable>
            </View>

            <Text style={{ color: T.colors.text }}>|</Text>

            <IconBtn onPress={t.toggleSortDir} style={styles.edgeAlignFixRight}>
              {t.sortDir === "asc" ? (
                <ArrowUp size={16} strokeWidth={1} color={T.colors.text} />
              ) : (
                <ArrowDown size={16} strokeWidth={1} color={T.colors.text} />
              )}
            </IconBtn>
          </View>
        )}
      </Animated.View>

      {mode !== "recycle" && showFilters && (
        <PopoverMenu
          visible={t.filterOpen}
          onClose={() => t.setFilterOpen(false)}
          anchorRef={t.filterAnchorRef}
          width={180}
          items={[
            {
              key: "dateCreated",
              label: radio("Date Created", t.sortBy === "dateCreated"),
              onPress: () => t.setSortBy("dateCreated"),
            },
            {
              key: "dateModified",
              label: radio("Date Modified", t.sortBy === "dateModified"),
              onPress: () => t.setSortBy("dateModified"),
            },
            {
              key: "title",
              label: radio("Title", t.sortBy === "title"),
              onPress: () => t.setSortBy("title"),
            },
          ]}
        />
      )}
    </View>
  );
}

function IconBtn({
  onPress,
  children,
  style,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      style={({ pressed }) => [
        { padding: 8, borderRadius: 10, opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

function radio(label: string, checked: boolean) {
  return (
    <Text>
      {checked ? "• " : "  "}
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  fullWrap: { paddingTop: 20, marginBottom: 10 },
  center: { alignItems: "center", marginBottom: 20 },
  row1: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  edgeAlignFixLeft: { marginLeft: -8 },
  edgeAlignFixRight: { marginRight: -8 },
  centerSearch: {
    flex: 1,
    height: 36,
    position: "relative",
    justifyContent: "center",
  },
  searchAnchor: { position: "absolute", right: 8, zIndex: 2 },
  searchBar: {
    position: "absolute",
    left: 0,
    right: 44,
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 10,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stickyWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 20,
    zIndex: 20,
  },
  stickyCenter: {
    flex: 1,
    height: 36,
    justifyContent: "center",
    marginLeft: 8,
    marginRight: 8,
  },
  stickyTitleLeft: { fontSize: 16, fontWeight: "600" },
  stickySearchBarInline: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 10,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  rightCluster: { flexDirection: "row", alignItems: "center", gap: 2 },
  searchInput: { fontSize: 14, paddingVertical: 0 },
  row2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 5,
    gap: 8,
  },
  allToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 10,
  },
  allLabel: { fontSize: 14, fontWeight: "600" },
});

const webNoOutline =
  Platform.OS === "web"
    ? ({
        outlineStyle: "none",
        outlineWidth: 0,
        outlineColor: "transparent",
      } as any)
    : undefined;
