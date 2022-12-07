SELECT sbc.*, 
  ctg.title as category_title,
  ctg.description as category_description,
  ctg.category_type,
  ctg.deleted_at as category_deleted_at,
  ctg.archived_at as category_archived_at
FROM
  ${sbc_table:name} as sbc
LEFT JOIN
  ${ctg_table:name} as ctg
  ON sbc.category_id = ctg.id
WHERE
  sbc.title = ${title}
  AND sbc.peer_id = ${peer_id}
  AND (${in_deleted} IS NULL OR ${in_deleted}=TRUE AND sbc.deleted_at IS NOT NULL OR ${in_deleted}=FALSE AND sbc.deleted_at IS NULL)
  AND (${in_archived} IS NULL OR ${in_archived}=TRUE AND sbc.archived_at IS NOT NULL OR ${in_archived}=FALSE AND sbc.archived_at IS NULL)
ORDER BY COALESCE(sbc.deleted_at, sbc.archived_at, sbc.updated_at, sbc.created_at) DESC