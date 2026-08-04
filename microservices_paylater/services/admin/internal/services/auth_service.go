package services

import (
	"context"
	"errors"

	"Paylater/services/admin/internal/database"
	"Paylater/services/admin/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

func AdminLogin(ctx context.Context, email, password string) (string, error) {

	admin, err := database.Queries.GetAdminByEmail(ctx, email)
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

	token, err := utils.GenerateToken(
		admin.ID,
		string(admin.Role),
	)
	if err != nil {
		return "", err
	}

	return token, nil
}
