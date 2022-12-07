UPDATE users 
SET
    status = ${status},
    first_name = ${first_name},
    username = ${username},
    language_code = ${language_code},
    week_starts_on = ${week_starts_on},
    time_zone = ${time_zone},
    quota = ${quota},
    updated_at = ${updated_at},
    deleted_at = ${deleted_at}
 WHERE id = ${id}
 RETURNING *;