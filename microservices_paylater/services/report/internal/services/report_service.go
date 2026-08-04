package services

import (
	"context"
	"database/sql"
	"fmt"

	"Paylater/services/report/internal/database"
	"Paylater/services/report/internal/db/sqlc"
)

func GetMerchantFeeCollected(merchantID sql.NullInt32) (string, error) {

	result, err := database.Queries.GetMerchantFeeCollected(context.Background(), merchantID)
	if err != nil {
		return "", err
	}

	switch v := result.(type) {
	case []byte:
		return string(v), nil
	case string:
		return v, nil
	case nil:
		return "0.00", nil
	default:
		return fmt.Sprintf("%v", v), nil
	}
}

func GetUserDue(userID int32) (string, error) {
	return database.Queries.GetUserDue(context.Background(), userID)
}

func GetUsersReachedCreditLimit() ([]sqlc.User, error) {
	return database.Queries.GetUsersReachedCreditLimit(context.Background())
}

func GetTotalUserDue() (string, error) {

	result, err := database.Queries.GetTotalUserDue(context.Background())
	if err != nil {
		return "", err
	}

	switch v := result.(type) {
	case []byte:
		return string(v), nil
	case string:
		return v, nil
	case nil:
		return "0.00", nil
	default:
		return fmt.Sprintf("%v", v), nil
	}
}

func GetCustomersWithDue() ([]sqlc.User, error) {
	return database.Queries.GetCustomersWithDue(context.Background())
}
