package services

import (
	"context"

	"Paylater/internal/database"
	"Paylater/internal/db/sqlc"
)

func CreateMerchant(merchant sqlc.CreateMerchantParams) error {

	err := database.Queries.CreateMerchant(context.Background(), merchant)

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