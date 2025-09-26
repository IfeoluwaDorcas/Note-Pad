import DeletedItemScreen from "@/components/DeletedItemScreen";

export default function DeletedStickyNotes() {
  return (
    <DeletedItemScreen
      type="sticky"
      title="Deleted Sticky Notes"
      label="pin"
      pluralLabel="pin"
    />
  );
}
