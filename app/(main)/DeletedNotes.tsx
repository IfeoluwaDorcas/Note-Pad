import DeletedItemScreen from "@/components/DeletedItemScreen";

export default function DeletedNotes() {
  return (
    <DeletedItemScreen
      type="note"
      title="Deleted Notes"
      label="note"
      pluralLabel="notes"
    />
  );
}
