-- name: CreateEmployee :exec
Insert into employees(name,salary) 
values(?,?);
-- name: GetEmployees :many
select * from employees;
-- name: GetEmployee :one
select * from employees
where id = ?;
-- name: UpdateEmployee :exec
UPDATE employees
SET
    name = ?,
    salary = ?
WHERE id = ?;
-- name: DeleteEmployee :exec
DELETE FROM employees
WHERE id = ?;