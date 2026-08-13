package services

import (
	"context"
	"errors"

	"Paylater/internal/database"
	"Paylater/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

// ---------------- USER LOGIN ----------------

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

// ---------------- MERCHANT LOGIN ----------------

func MerchantLogin(email, password string) (string, error) {

	merchant, err := database.Queries.GetMerchantByEmail(context.Background(), email)
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

// ---------------- ADMIN LOGIN ----------------

func AdminLogin(email, password string) (string, error) {

	admin, err := database.Queries.GetAdminByEmail(context.Background(), email)
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

	// Use the role stored in the database (ADMIN or SUPER_ADMIN)
	token, err := utils.GenerateToken(
		admin.ID,
		string(admin.Role),
	)
	if err != nil {
		return "", err
	}

	return token, nil
}