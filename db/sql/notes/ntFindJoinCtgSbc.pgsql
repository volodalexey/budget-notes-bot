SELECT nt.*, 
  ctg.title as category_title,
  ctg.category_type,
  ctg.deleted_at as category_deleted_at,
  ctg.archived_at as category_archived_at,
  sbc.title as subcategory_title,
  sbc.deleted_at as subcategory_deleted_at,
  sbc.archived_at as subcategory_archived_at
FROM 
  ${nt_table:name} AS nt
  INNER JOIN ${ctg_table:name} AS ctg ON nt.category_id = ctg.id
  LEFT JOIN ${sbc_table:name} AS sbc ON nt.subcategory_id = sbc.id
WHERE nt.id = ${note_id}
  AND nt.peer_id = ${peer_id}
  AND (${in_deleted} IS NULL OR ${in_deleted}=TRUE AND nt.deleted_at IS NOT NULL OR ${in_deleted}=FALSE AND nt.deleted_at IS NULL)
  AND (${in_archived} IS NULL OR ${in_archived}=TRUE AND nt.archived_at IS NOT NULL OR ${in_archived}=FALSE AND nt.archived_at IS NULL)