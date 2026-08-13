package services

import (
	"context"
	"errors"

	"Paylater/shared/auth"

	"golang.org/x/crypto/bcrypt"
)

func (s *Service) AdminLogin(ctx context.Context, email, password string) (string, error) {

	admin, err := s.queries.GetAdminByEmail(ctx, email)
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(admin.Password),
		[]byte(password),
	)
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	token, err := auth.GenerateToken(
		admin.ID,
		string(admin.Role),
	)
	if err != nil {
		return "", err
	}

	return token, nil
}
