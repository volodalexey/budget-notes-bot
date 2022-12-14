INSERT INTO ${nt_table:name}(
    note_number, 
    note_text, 
    peer_id, 
    category_id, 
    subcategory_id, 
    datetime, 
    created_by_user_id,
    created_at,
    updated_by_user_id,
    updated_at,
    deleted_by_user_id,
    deleted_at,
    archived_by_user_id,
    archived_at
)
VALUES(
    ${note_number}, 
    ${note_text}, 
    ${peer_id}, 
    ${category_id}, 
    ${subcategory_id}, 
    ${datetime}, 
    ${created_by_user_id}, 
    ${created_at}, 
    ${updated_by_user_id},
    ${updated_at},
    ${deleted_by_user_id},
    ${deleted_at},
    ${archived_by_user_id},
    ${archived_at}
)
RETURNING *
