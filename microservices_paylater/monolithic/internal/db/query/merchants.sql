-- name: CreateMerchant :exec
INSERT INTO merchants (
    merchant_name,
    email,
    password,
    phone_number,
    commission_percentage
)
VALUES (?, ?, ?, ?, ?);

-- name: GetMerchantByID :one
SELECT *
FROM merchants
WHERE id = ?;

-- name: GetAllMerchants :many
SELECT *
FROM merchants;

-- name: UpdateMerchant :exec
UPDATE merchants
SET merchant_name = ?, phone_number = ?
WHERE id = ?;

-- name: UpdateCommission :exec
UPDATE merchants
SET commission_percentage = ?
WHERE id = ?;

-- name: DeleteMerchant :exec
DELETE FROM merchants
WHERE id = ?;

-- name: GetMerchantByEmail :one
SELECT *
FROM merchants
WHERE email = ?;