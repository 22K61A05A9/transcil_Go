package services

import (
	"context"
	"errors"

	"Paylater/services/merchant/internal/database"
	"Paylater/services/merchant/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

func MerchantLogin(ctx context.Context, email, password string) (string, error) {

	merchant, err := database.Queries.GetMerchantByEmail(ctx, email)
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(merchant.Password),
		[]byte(password),
	)
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	token, err := utils.GenerateToken(
		merchant.ID,
		"merchant",
	)
	if err != nil {
		return "", err
	}

	return token, nil
}
