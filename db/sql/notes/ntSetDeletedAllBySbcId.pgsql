UPDATE ${nt_table:name}
SET deleted_at=${deleted_at}, deleted_by_user_id=${deleted_by_user_id}
WHERE 
    subcategory_id=${subcategory_id} 
    AND peer_id=${peer_id}
    AND (${in_deleted} IS NULL OR ${in_deleted}=TRUE AND deleted_at IS NOT NULL OR ${in_deleted}=FALSE AND deleted_at IS NULL)
RETURNING *;