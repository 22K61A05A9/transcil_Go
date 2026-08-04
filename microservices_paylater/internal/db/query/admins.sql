-- name: CreateAdmin :exec
INSERT INTO admins (
    admin_name,
    email,
    password,
    role
)
VALUES (?, ?, ?, ?);

-- name: GetAdminByEmail :one
SELECT *
FROM admins
WHERE email = ?;

-- name: GetAdminByID :one
SELECT *
FROM admins
WHERE id = ?;

-- name: GetAllAdmins :many
SELECT *
FROM admins
ORDER BY id;

-- name: DeleteAdmin :exec
DELETE FROM admins
WHERE id = ?;