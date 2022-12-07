CREATE TABLE IF NOT EXISTS ${nt_table:name}
(
    id SERIAL PRIMARY KEY,
    note_number NUMERIC(15,4) NULL,
    note_text CHARACTER VARYING(1000) NULL,
    datetime TIMESTAMPTZ NOT NULL,
    peer_id CHARACTER VARYING(100) NOT NULL,
    category_id INTEGER REFERENCES ${ctg_table:name} (id) NOT NULL,
    subcategory_id INTEGER REFERENCES ${sbc_table:name} (id) NULL,
    created_by_user_id CHARACTER VARYING(100) REFERENCES users (id) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_by_user_id CHARACTER VARYING(100) REFERENCES users (id) NULL,
    updated_at TIMESTAMPTZ NULL,
    deleted_by_user_id CHARACTER VARYING(100) REFERENCES users (id) NULL,
    deleted_at TIMESTAMPTZ NULL,
    archived_by_user_id CHARACTER VARYING(100) REFERENCES users (id) NULL,
    archived_at TIMESTAMPTZ NULL
);