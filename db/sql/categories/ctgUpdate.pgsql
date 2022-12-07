UPDATE ${ctg_table:name}
SET title = ${title},
    description = ${description},
    updated_by_user_id = ${updated_by_user_id},
    updated_at = ${updated_at},
    deleted_by_user_id = ${deleted_by_user_id},
    deleted_at = ${deleted_at},
    archived_by_user_id = ${archived_by_user_id},
    archived_at = ${archived_at}
WHERE id=${id}
RETURNING *;