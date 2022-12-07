CREATE TABLE IF NOT EXISTS ${ctg_table:name}
(
    id SERIAL PRIMARY KEY,
    title CHARACTER VARYING(100) NOT NULL,
    description CHARACTER VARYING(200) NULL,
    peer_id CHARACTER VARYING(100) NOT NULL,
    category_type CHARACTER VARYING(100) NOT NULL,
    created_by_user_id CHARACTER VARYING(100) REFERENCES users (id) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_by_user_id CHARACTER VARYING(100) REFERENCES users (id) NULL,
    updated_at TIMESTAMPTZ NULL,
    deleted_by_user_id CHARACTER VARYING(100) REFERENCES users (id) NULL,
    deleted_at TIMESTAMPTZ NULL,
    archived_by_user_id CHARACTER VARYING(100) REFERENCES users (id) NULL,
    archived_at TIMESTAMPTZ NULL
);