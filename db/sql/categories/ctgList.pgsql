SELECT * FROM ${ctg_table:name}
WHERE 
    peer_id = ${peer_id}
    AND (${in_deleted} IS NULL OR ${in_deleted}=TRUE AND deleted_at IS NOT NULL OR ${in_deleted}=FALSE AND deleted_at IS NULL)