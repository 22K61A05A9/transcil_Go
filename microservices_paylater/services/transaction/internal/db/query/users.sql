-- name: GetUserByID :one
SELECT *
FROM users
WHERE id = ?;

-- name: UpdateCurrentDue :exec
UPDATE users
SET current_due = ?
WHERE id = ?;
