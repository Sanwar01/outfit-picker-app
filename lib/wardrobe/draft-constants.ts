/** Marks wardrobe items pending user review (status stays archived until confirm). */
export const DRAFT_NOTES_MARKER = "__wardrobe_draft__";

export function isDraftItem(item: {
  status: string;
  notes: string | null;
}): boolean {
  return item.status === "draft" || item.notes === DRAFT_NOTES_MARKER;
}
