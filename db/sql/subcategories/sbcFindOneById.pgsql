SELECT * FROM ${sbc_table:name}
WHERE
    id = ${id}
    AND peer_id = ${peer_id}
    AND (${in_deleted} IS NULL OR ${in_deleted}=TRUE AND deleted_at IS NOT NULL OR ${in_deleted}=FALSE AND deleted_at IS NULL)
    AND (${in_archived} IS NULL OR ${in_archived}=TRUE AND archived_at IS NOT NULL OR ${in_archived}=FALSE AND archived_at IS NULL)
ORDER BY COALESCE(deleted_at, archived_at, updated_at, created_at) DESC