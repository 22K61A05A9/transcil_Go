package services

import (
	"context"
	"errors"
	"strconv"

	"Paylater/services/merchant/internal/database"
	"Paylater/services/merchant/internal/db/sqlc"

	"golang.org/x/crypto/bcrypt"
)

func CreateMerchant(ctx context.Context, merchant sqlc.CreateMerchantParams) error {

	// Validate Commission Percentage (Allowed only between 3% and 10%)
	commission, err := strconv.ParseFloat(merchant.CommissionPercentage, 64)
	if err != nil {
		return errors.New("invalid commission percentage")
	}

	if commission < 3 || commission > 10 {
		return errors.New("commission percentage must be between 3 and 10")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(merchant.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	merchant.Password = string(hashedPassword)

	return database.Queries.CreateMerchant(ctx, merchant)
}

func GetMerchants(ctx context.Context) ([]sqlc.Merchant, error) {
	return database.Queries.GetAllMerchants(ctx)
}

func GetMerchantByID(ctx context.Context, id int32) (sqlc.Merchant, error) {
	return database.Queries.GetMerchantByID(ctx, id)
}

func UpdateMerchant(ctx context.Context, merchant sqlc.UpdateMerchantParams) error {
	return database.Queries.UpdateMerchant(ctx, merchant)
}

func UpdateCommission(ctx context.Context, merchant sqlc.UpdateCommissionParams) error {
	return database.Queries.UpdateCommission(ctx, merchant)
}

func DeleteMerchant(ctx context.Context, id int32) error {
	return database.Queries.DeleteMerchant(ctx, id)
}
