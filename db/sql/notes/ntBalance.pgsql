SELECT
  MAX(nt.datetime) AS max_datetime,
  MIN(nt.datetime) AS min_datetime,
  COALESCE(SUM(nt.note_number), 0) AS balance,
  COUNT(nt.note_number) AS counted
FROM 
  ${nt_table:name} AS nt
  INNER JOIN ${ctg_table:name} AS ctg ON nt.category_id = ctg.id
  LEFT JOIN ${sbc_table:name} AS sbc ON nt.subcategory_id = sbc.id
WHERE nt.peer_id = ${peer_id}
  AND (${start_datetime} IS NULL OR nt.datetime >= ${start_datetime})
  AND (${end_datetime} IS NULL OR nt.datetime <= ${end_datetime})
  AND (${in_deleted} IS NULL OR ${in_deleted}=TRUE AND nt.deleted_at IS NOT NULL OR ${in_deleted}=FALSE AND nt.deleted_at IS NULL)
  AND (${in_archived} IS NULL OR ${in_archived}=TRUE AND nt.archived_at IS NOT NULL OR ${in_archived}=FALSE AND nt.archived_at IS NULL)