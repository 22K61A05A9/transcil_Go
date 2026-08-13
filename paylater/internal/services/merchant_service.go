package services

import (
	"context"
	"errors"
	"strconv"

	"Paylater/internal/database"
	"Paylater/internal/db/sqlc"

	"golang.org/x/crypto/bcrypt"
)

func CreateMerchant(merchant sqlc.CreateMerchantParams) error {

	// Validate Commission Percentage (Allowed only between 3% and 10%)
	commission, err := strconv.ParseFloat(merchant.CommissionPercentage, 64)
	if err != nil {
		return errors.New("invalid commission percentage")
	}

	if commission < 3 || commission > 10 {
		return errors.New("commission percentage must be between 3 and 10")
	}

	// Hash Password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(merchant.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	// Store hashed password
	merchant.Password = string(hashedPassword)

	// Save Merchant
	err = database.Queries.CreateMerchant(context.Background(), merchant)
	if err != nil {
		return err
	}

	return nil
}

func GetMerchants() ([]sqlc.Merchant, error) {

	merchants, err := database.Queries.GetAllMerchants(context.Background())
	if err != nil {
		return nil, err
	}

	return merchants, nil
}

func GetMerchantByID(id int32) (sqlc.Merchant, error) {

	merchant, err := database.Queries.GetMerchantByID(context.Background(), id)
	if err != nil {
		return sqlc.Merchant{}, err
	}

	return merchant, nil
}

func UpdateMerchant(merchant sqlc.UpdateMerchantParams) error {

	err := database.Queries.UpdateMerchant(context.Background(), merchant)
	if err != nil {
		return err
	}

	return nil
}

func UpdateCommission(merchant sqlc.UpdateCommissionParams) error {

	// Admin can set any commission percentage.
	err := database.Queries.UpdateCommission(context.Background(), merchant)
	if err != nil {
		return err
	}

	return nil
}

func DeleteMerchant(id int32) error {

	err := database.Queries.DeleteMerchant(context.Background(), id)
	if err != nil {
		return err
	}

	return nil
}