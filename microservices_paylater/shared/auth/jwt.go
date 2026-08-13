package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// SecretKey is used to sign and verify JWT tokens.
// Call InitJWTSecret after loading .env.
var SecretKey []byte

var (
	// ErrInvalidToken is returned when a token cannot be parsed or is expired/invalid.
	ErrInvalidToken = errors.New("invalid or expired token")
	// ErrInvalidClaims is returned when token claims are not a valid map.
	ErrInvalidClaims = errors.New("invalid token claims")
	// ErrMissingJWTSecret is returned when JWT_SECRET is missing or empty.
	ErrMissingJWTSecret = errors.New("JWT_SECRET environment variable is required and must not be empty")
)

// InitJWTSecret loads JWT_SECRET from the environment into SecretKey.
// Returns an error if JWT_SECRET is missing or empty.
func InitJWTSecret() error {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return ErrMissingJWTSecret
	}
	SecretKey = []byte(secret)
	return nil
}

// GenerateToken creates a JWT token with id, role, and 24h expiry (HS256).
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

// ParseToken verifies a JWT and returns its map claims.
// Only HS256-signed tokens are accepted.
func ParseToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, jwt.ErrTokenSignatureInvalid
		}
		return SecretKey, nil
	})

	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, ErrInvalidClaims
	}

	return claims, nil
}
