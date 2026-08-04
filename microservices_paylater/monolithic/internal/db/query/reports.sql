-- name: GetMerchantFeeCollected :one
SELECT SUM(commission) AS total_fee FROM transactions WHERE merchant_id = ?;
-- name: GetUserDue :one
SELECT current_due FROM users WHERE id = ?;
-- name: GetUsersReachedCreditLimit :many
SELECT * FROM users WHERE current_due >= credit_limit;
-- name: GetTotalUserDue :one
SELECT SUM(current_due) AS total_due FROM users;
-- name: GetCustomersWithDue :many
SELECT * FROM users WHERE current_due > 0 ORDER BY current_due DESC;