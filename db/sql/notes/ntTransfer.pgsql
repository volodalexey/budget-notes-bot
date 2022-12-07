UPDATE ${nt_table:name}
    SET
        updated_by_user_id = COALESCE(${updated_by_user_id}, updated_by_user_id),
        updated_at = COALESCE(${updated_at}, updated_at),
        category_id = ${to_category_id},
        subcategory_id = ${to_subcategory_id}
    WHERE
        id = ${note_id}
        AND peer_id = ${peer_id}
        AND (${from_category_id} IS NULL OR category_id = ${from_category_id})
        AND (${from_subcategory_id} IS NULL OR subcategory_id = ${from_subcategory_id})
        AND (${in_deleted} IS NULL OR ${in_deleted}=TRUE AND deleted_at IS NOT NULL OR ${in_deleted}=FALSE AND deleted_at IS NULL)
    RETURNING *