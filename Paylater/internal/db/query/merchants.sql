-- name: CreateMerchant :exec
INSERT INTO merchants (merchant_name,phone_number,commission_percentage)VALUES (?, ?, ?);
-- name: GetMerchantByID :one
select * from merchants where id = ?;
-- name: GetAllMerchants :many
select * from merchants;
-- name: UpdateMerchant :exec
UPDATE merchants SET merchant_name = ?, phone_number = ? WHERE id = ?;
-- name: UpdateCommission :exec
update merchants set commission_percentage = ? where id = ?;
-- name: DeleteMerchant :exec
DELETE FROM merchants WHERE id = ?;
