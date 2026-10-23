export interface FallbackSelectableItem {
  id: string;
  isHeader?: boolean;
}

export interface FallbackSelectableGroup {
  groupId: string;
  items: FallbackSelectableItem[];
}

interface ResolveProviderFallbackSelectionOptions {
  groups: FallbackSelectableGroup[];
  selectedGroupId: string;
  selectedItemId: string;
  preserveMissingGroup?: boolean;
}

function getFirstSelectableItemId(group: FallbackSelectableGroup): string | null {
  return group.items.find((item) => !item.isHeader)?.id ?? null;
}

export function resolveProviderFallbackSelection({
  groups,
  selectedGroupId,
  selectedItemId,
  preserveMissingGroup = false,
}: ResolveProviderFallbackSelectionOptions): { groupId: string; itemId: string } | null {
  if (groups.length === 0) {
    return null;
  }

  const selectedGroup = groups.find((group) => group.groupId === selectedGroupId);

  if (!selectedGroup) {
    if (preserveMissingGroup) {
      return null;
    }

    const fallbackGroup = groups.find((group) => getFirstSelectableItemId(group));
    const fallbackItemId = fallbackGroup ? getFirstSelectableItemId(fallbackGroup) : null;

    if (!fallbackGroup || !fallbackItemId) {
      return null;
    }

    return {
      groupId: fallbackGroup.groupId,
      itemId: fallbackItemId,
    };
  }

  const isSelectedItemValid = selectedGroup.items.some(
    (item) => !item.isHeader && item.id === selectedItemId,
  );

  if (isSelectedItemValid) {
    return null;
  }

  const fallbackItemId = getFirstSelectableItemId(selectedGroup);
  if (!fallbackItemId) {
    return null;
  }

  return {
    groupId: selectedGroup.groupId,
    itemId: fallbackItemId,
  };
}
