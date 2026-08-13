package services

import (
	"context"
	"errors"

	"Paylater/shared/auth"

	"golang.org/x/crypto/bcrypt"
)

func (s *Service) MerchantLogin(ctx context.Context, email, password string) (string, error) {

	merchant, err := s.queries.GetMerchantByEmail(ctx, email)
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

	token, err := auth.GenerateToken(
		merchant.ID,
		"merchant",
	)
	if err != nil {
		return "", err
	}

	return token, nil
}
