-- name: GetMerchantByID :one
SELECT *
FROM merchants
WHERE id = ?;
