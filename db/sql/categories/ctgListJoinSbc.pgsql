SELECT ctg.*, 
    array_agg(sbc.id ORDER BY COALESCE(sbc.deleted_at, sbc.archived_at, sbc.updated_at, sbc.created_at) DESC) as subcategories_ids,
    array_agg(sbc.title ORDER BY COALESCE(sbc.deleted_at, sbc.archived_at, sbc.updated_at, sbc.created_at) DESC) as subcategories_titles,
    array_agg(sbc.description ORDER BY COALESCE(sbc.deleted_at, sbc.archived_at, sbc.updated_at, sbc.created_at) DESC) as subcategories_descriptions,
    array_agg(sbc.deleted_at ORDER BY COALESCE(sbc.deleted_at, sbc.archived_at, sbc.updated_at, sbc.created_at) DESC) as subcategories_deleted_at,
    array_agg(sbc.archived_at ORDER BY COALESCE(sbc.deleted_at, sbc.archived_at, sbc.updated_at, sbc.created_at) DESC) as subcategories_archived_at
FROM
    ${ctg_table:name} as ctg
LEFT JOIN
    ${sbc_table:name} as sbc
    ON sbc.category_id = ctg.id
WHERE
    ctg.peer_id = ${peer_id}
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
    AND (${in_deleted} IS NULL OR ${in_deleted}=TRUE AND ctg.deleted_at IS NOT NULL OR ${in_deleted}=FALSE AND ctg.deleted_at IS NULL)
    AND (${in_archived} IS NULL OR ${in_archived}=TRUE AND ctg.archived_at IS NOT NULL OR ${in_archived}=FALSE AND ctg.archived_at IS NULL)
GROUP BY ctg.id
ORDER BY COALESCE(ctg.deleted_at, ctg.archived_at, ctg.updated_at, ctg.created_at) DESC
LIMIT ${limit} OFFSET ${offset}