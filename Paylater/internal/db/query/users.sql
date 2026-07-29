-- name: CreateUser :exec
INSERT INTO users (user_name, email,password ,role)VALUES (?, ?,?,?);
-- name: GetUserByID :one
SELECT * FROM users WHERE id = ?;
-- name: GetAllUsers :many
SELECT * FROM users;
-- name: UpdateUser :exec
UPDATE users SET user_name = ?, email = ? WHERE id = ?;
-- name: DeleteUser :exec
DELETE FROM users WHERE id = ?;
-- name: UpdateCurrentDue :exec
UPDATE users
SET current_due = ?
WHERE id = ?;
-- name: GetUserByEmail :one
SELECT *
FROM users
WHERE email = ?;