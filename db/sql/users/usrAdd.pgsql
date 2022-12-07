INSERT INTO users(
    id,
    status,
    first_name, 
    username, 
    language_code, 
    week_starts_on, 
    time_zone,
    quota,
    created_at,
    updated_at,
    deleted_at
) 
VALUES(
    ${id},
    ${status},
    ${first_name},
    ${username},
    ${language_code},
    ${week_starts_on},
    ${time_zone},
    ${quota},
    ${created_at},
    ${updated_at},
    ${deleted_at}
)
RETURNING *