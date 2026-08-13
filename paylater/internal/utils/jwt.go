package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Secret key used to sign and verify JWT tokens.
var SecretKey = []byte(os.Getenv("JWT_SECRET"))

// GenerateToken creates a JWT token.
func GenerateToken(id int32, role string) (string, error) {

	claims := jwt.MapClaims{
		"id":   id,
		"role": role,
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(SecretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}