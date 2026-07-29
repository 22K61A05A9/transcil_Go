
package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Secret key used to sign and verify JWT tokens.
var SecretKey = []byte("paylater-secret-key")

// GenerateToken creates a JWT token for the logged-in user.
func GenerateToken(userID int32, role string) (string, error) {

	// Claims are the data stored inside the JWT.
	claims := jwt.MapClaims{
		"user_id": userID,                              
		"role":    role,                               
		"exp":     time.Now().Add(24 * time.Hour).Unix(), // Token expires after 24 hours
	}

	// Create a new JWT token using the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token using the secret key
	tokenString, err := token.SignedString(SecretKey)
	if err != nil {
		return "", err
	}

	// Return the generated JWT
	return tokenString, nil
}