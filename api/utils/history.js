export const recordEditHistory = async (
    { event_id, editor_id, edit_type, old_value = null, new_value = null },
    tx
  ) => {
    if (!tx) throw new Error("Transaction client (tx) is required");
    return tx.eventEditHistory.create({
      data: {
        event_id,
        editor_id,
        edit_type,
        old_value,
        new_value,
      },
    });
  };
  