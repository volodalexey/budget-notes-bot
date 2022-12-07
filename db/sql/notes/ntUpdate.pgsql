UPDATE ${nt_table:name}
SET
    note_number = ${note_number},
    note_text = ${note_text},
    datetime = ${datetime},
    updated_by_user_id = ${updated_by_user_id},
    updated_at = ${updated_at},
    deleted_by_user_id = ${deleted_by_user_id},
    deleted_at = ${deleted_at},
    archived_by_user_id = ${archived_by_user_id},
    archived_at = ${archived_at}
WHERE id = ${id}
RETURNING *;