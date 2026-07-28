-- name: CreateTransaction :exec
Insert into transactions (user_id, merchant_id, amount, commission,commission_percentage) values (?,?,?,?,?);
-- name: GetTransactionByID :one
Select * from transactions where id = ?;
-- name: GetAllTransactions :many
Select * from transactions;
-- name: GetTransactionsByUser :many
SELECT * FROM transactions WHERE user_id = ?;
-- name: GetTransactionsByMerchant :many
SELECT *FROM transactions WHERE merchant_id = ?;
