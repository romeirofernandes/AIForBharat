exports.up = (pgm) => {
    pgm.createTable("users", {
        id: "id",
        email: { type: "varchar(255)", notNull: true, unique: true },
        password_hash: { type: "text", notNull: true },
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp"),
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable("users");
};