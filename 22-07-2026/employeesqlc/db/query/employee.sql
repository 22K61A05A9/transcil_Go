-- name: CreateEmployee :exec
INSERT INTO emp1 (
    name,
    age,
    salary
)
VALUES (?, ?, ?);

-- name: GetEmployee :one
SELECT id, name, age, salary
FROM emp1
WHERE id = ?;

-- name: ListEmployees :many
SELECT id, name, age, salary
FROM emp1;

-- name: UpdateEmployee :exec
UPDATE emp1
SET
    name = ?,
    age = ?,
    salary = ?
WHERE id = ?;

-- name: DeleteEmployee :exec
DELETE FROM emp1
WHERE id = ?;