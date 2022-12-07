UPDATE ${sbc_table:name}
SET archived_at=${archived_at}, archived_by_user_id=${archived_by_user_id}
WHERE 
    category_id=${category_id}
    AND peer_id=${peer_id}
    AND (${in_archived} IS NULL OR ${in_archived}=TRUE AND archived_at IS NOT NULL OR ${in_archived}=FALSE AND archived_at IS NULL)
RETURNING *;