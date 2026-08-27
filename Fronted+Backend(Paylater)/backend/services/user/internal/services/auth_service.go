package services

import (
	"context"
	"errors"

	"Paylater/shared/auth"

	"golang.org/x/crypto/bcrypt"
)

func (s *Service) UserLogin(ctx context.Context, email, password string) (string, error) {

	user, err := s.queries.GetUserByEmail(ctx, email)
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(password),
	)
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	token, err := auth.GenerateToken(
		user.ID,
		"user",
	)
	if err != nil {
		return "", err
	}

	return token, nil
}
