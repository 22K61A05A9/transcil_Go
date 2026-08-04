package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// SecretKey is used to sign and verify JWT tokens.
// Call InitJWTSecret after loading .env.
var SecretKey []byte

// InitJWTSecret loads JWT_SECRET from the environment into SecretKey.
func InitJWTSecret() {
	SecretKey = []byte(os.Getenv("JWT_SECRET"))
}

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
