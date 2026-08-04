package services

import (
	"context"
	"errors"

	"Paylater/services/user/internal/database"
	"Paylater/services/user/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

func UserLogin(email, password string) (string, error) {

	user, err := database.Queries.GetUserByEmail(context.Background(), email)
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

	token, err := utils.GenerateToken(
		user.ID,
		"user",
	)
	if err != nil {
		return "", err
	}

	return token, nil
}
