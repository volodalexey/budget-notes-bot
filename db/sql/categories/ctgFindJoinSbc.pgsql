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
    ctg.title = ${title}
    AND ctg.peer_id = ${peer_id} 
    AND (${in_deleted} IS NULL OR ${in_deleted}=TRUE AND ctg.deleted_at IS NOT NULL OR ${in_deleted}=FALSE AND ctg.deleted_at IS NULL)
    AND (${in_archived} IS NULL OR ${in_archived}=TRUE AND ctg.archived_at IS NOT NULL OR ${in_archived}=FALSE AND ctg.archived_at IS NULL)
GROUP BY ctg.id
ORDER BY COALESCE(ctg.deleted_at, ctg.archived_at, ctg.updated_at, ctg.created_at) DESC