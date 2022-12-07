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
  sbc.peer_id = ${peer_id}
  AND (
      (${query} IS NULL OR ctg.title ~* ${query} OR ctg.description ~* ${query}) OR
      (${query} IS NULL OR sbc.title ~* ${query} OR sbc.description ~* ${query})
      )
  AND (${ctgQuery} IS NULL OR ctg.title ~* ${ctgQuery} OR ctg.description ~* ${ctgQuery})
  AND (${sbcQuery} IS NULL OR sbc.title ~* ${sbcQuery} OR sbc.description ~* ${sbcQuery})
  AND (${ctgQueryTitle} IS NULL OR ctg.title ~* ${ctgQueryTitle})
  AND (${sbcQueryTitle} IS NULL OR sbc.title ~* ${sbcQueryTitle})
  AND (${ctgQueryDescr} IS NULL OR ctg.description ~* ${ctgQueryDescr})
  AND (${sbcQueryDescr} IS NULL OR sbc.description ~* ${sbcQueryDescr})
  AND (${ctgQueryIdGreaterThan} IS NULL OR ctg.id > ${ctgQueryIdGreaterThan})
  AND (${ctgQueryIdGreaterThanOrEq} IS NULL OR ctg.id >= ${ctgQueryIdGreaterThanOrEq})
  AND (${ctgQueryIdLessThan} IS NULL OR ctg.id < ${ctgQueryIdLessThan})
  AND (${ctgQueryIdLessThanOrEq} IS NULL OR ctg.id <= ${ctgQueryIdLessThanOrEq})
  AND (${sbcQueryIdGreaterThan} IS NULL OR sbc.id > ${sbcQueryIdGreaterThan})
  AND (${sbcQueryIdGreaterThanOrEq} IS NULL OR sbc.id >= ${sbcQueryIdGreaterThanOrEq})
  AND (${sbcQueryIdLessThan} IS NULL OR sbc.id < ${sbcQueryIdLessThan})
  AND (${sbcQueryIdLessThanOrEq} IS NULL OR sbc.id <= ${sbcQueryIdLessThanOrEq})
  AND (${in_deleted} IS NULL OR ${in_deleted}=TRUE AND sbc.deleted_at IS NOT NULL OR ${in_deleted}=FALSE AND sbc.deleted_at IS NULL)
  AND (${in_archived} IS NULL OR ${in_archived}=TRUE AND sbc.archived_at IS NOT NULL OR ${in_archived}=FALSE AND sbc.archived_at IS NULL)
ORDER BY COALESCE(sbc.deleted_at, sbc.archived_at, sbc.updated_at, sbc.created_at) DESC
LIMIT ${limit} OFFSET ${offset}