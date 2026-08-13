package services

import (
	"context"
	"errors"
	"Paylater/internal/database"
	"Paylater/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

func Login(email, password string) (string, error) {

	// Find user by email
	user, err := database.Queries.GetUserByEmail(context.Background(), email)
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	// Compare entered password with stored hashed password
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(password),
	)
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	// Generate JWT Token
	token, err := utils.GenerateToken(
		user.ID,
		string(user.Role),
	)
	if err != nil {
		return "", err
	}

	// Return JWT
	return token, nil
}