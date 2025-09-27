// hooks/useSelection.ts
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import { BackHandler } from "react-native";

export function useSelection(allIds: string[]) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const enterSelection = useCallback((firstId?: string) => {
    setSelectionMode(true);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (firstId) next.add(firstId);
      return next;
    });
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }, []);

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const allSelected =
    selectedIds.size > 0 && selectedIds.size === allIds.length;

  const toggleSelectAll = useCallback(() => {
    if (!allIds.length) return;
    setSelectedIds((prev) =>
      prev.size === allIds.length ? new Set() : new Set(allIds)
    );
  }, [allIds]);

  // back button handler
  React.useEffect(() => {
    if (!selectionMode) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      exitSelection();
      return true; // prevent default
    });
    return () => sub.remove();
  }, [selectionMode, exitSelection]);

  return {
    selectionMode,
    selectedIds,
    enterSelection,
    exitSelection,
    toggleSelect,
    toggleSelectAll,
    allSelected,
  };
}
