DELETE FROM ${sbc_table:name}
WHERE ${peer_id} IS NULL OR peer_id=${peer_id}
RETURNING *;