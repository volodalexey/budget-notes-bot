SELECT nt.*, 
  ctg.title as category_title,
  ctg.category_type,
  ctg.deleted_at as category_deleted_at,
  ctg.archived_at as category_archived_at,
  sbc.title as subcategory_title,
  sbc.deleted_at as subcategory_deleted_at,
  sbc.archived_at as subcategory_archved_at
FROM 
  ${nt_table:name} AS nt
  INNER JOIN ${ctg_table:name} AS ctg ON nt.category_id = ctg.id
  LEFT JOIN ${sbc_table:name} AS sbc ON nt.subcategory_id = sbc.id
WHERE nt.peer_id = ${peer_id}
  AND (
      (${query} IS NULL OR ctg.title ~* ${query} OR ctg.description ~* ${query}) OR
      (${query} IS NULL OR sbc.title ~* ${query} OR sbc.description ~* ${query}) OR
      ${query} IS NULL OR nt.note_text ~* ${query}
      )
  AND (${ctgQuery} IS NULL OR ctg.title ~* ${ctgQuery} OR ctg.description ~* ${ctgQuery})
  AND (${sbcQuery} IS NULL OR sbc.title ~* ${sbcQuery} OR sbc.description ~* ${sbcQuery})
  AND (${ctgQueryTitle} IS NULL OR ctg.title ~* ${ctgQueryTitle})
  AND (${sbcQueryTitle} IS NULL OR sbc.title ~* ${sbcQueryTitle})
  AND (${ntQueryText} IS NULL OR nt.note_text ~* ${ntQueryText})
  AND (${ctgQueryDescr} IS NULL OR ctg.description ~* ${ctgQueryDescr})
  AND (${sbcQueryDescr} IS NULL OR sbc.description ~* ${sbcQueryDescr})
  AND (${ntQueryNumber} IS NULL OR nt.note_number = ${ntQueryNumber})
  AND (${ntQueryNumberGreaterThan} IS NULL OR nt.note_number > ${ntQueryNumberGreaterThan})
  AND (${ntQueryNumberGreaterThanOrEq} IS NULL OR nt.note_number >= ${ntQueryNumberGreaterThanOrEq})
  AND (${ntQueryNumberLessThan} IS NULL OR nt.note_number < ${ntQueryNumberLessThan})
  AND (${ntQueryNumberLessThanOrEq} IS NULL OR nt.note_number <= ${ntQueryNumberLessThanOrEq})
  AND (${ctgQueryIdGreaterThan} IS NULL OR ctg.id > ${ctgQueryIdGreaterThan})
  AND (${ctgQueryIdGreaterThanOrEq} IS NULL OR ctg.id >= ${ctgQueryIdGreaterThanOrEq})
  AND (${ctgQueryIdLessThan} IS NULL OR ctg.id < ${ctgQueryIdLessThan})
  AND (${ctgQueryIdLessThanOrEq} IS NULL OR ctg.id <= ${ctgQueryIdLessThanOrEq})
  AND (${sbcQueryIdGreaterThan} IS NULL OR sbc.id > ${sbcQueryIdGreaterThan})
  AND (${sbcQueryIdGreaterThanOrEq} IS NULL OR sbc.id >= ${sbcQueryIdGreaterThanOrEq})
  AND (${sbcQueryIdLessThan} IS NULL OR sbc.id < ${sbcQueryIdLessThan})
  AND (${sbcQueryIdLessThanOrEq} IS NULL OR sbc.id <= ${sbcQueryIdLessThanOrEq})
  AND (${ntQueryIdGreaterThan} IS NULL OR nt.id > ${ntQueryIdGreaterThan})
  AND (${ntQueryIdGreaterThanOrEq} IS NULL OR nt.id >= ${ntQueryIdGreaterThanOrEq})
  AND (${ntQueryIdLessThan} IS NULL OR nt.id < ${ntQueryIdLessThan})
  AND (${ntQueryIdLessThanOrEq} IS NULL OR nt.id <= ${ntQueryIdLessThanOrEq})
  AND (${start_datetime} IS NULL OR nt.datetime >= ${start_datetime})
  AND (${end_datetime} IS NULL OR nt.datetime <= ${end_datetime})
  AND (${in_deleted} IS NULL OR ${in_deleted}=TRUE AND nt.deleted_at IS NOT NULL OR ${in_deleted}=FALSE AND nt.deleted_at IS NULL)
  AND (${in_archived} IS NULL OR ${in_archived}=TRUE AND nt.archived_at IS NOT NULL OR ${in_archived}=FALSE AND nt.archived_at IS NULL)
ORDER BY nt.datetime DESC
LIMIT ${limit} OFFSET ${offset}