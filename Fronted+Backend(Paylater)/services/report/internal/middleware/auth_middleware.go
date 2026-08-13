package middleware

import (
	"errors"
	"net/http"
	"strings"

	"Paylater/shared/auth"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header required",
			})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")

		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid Authorization header format",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		claims, err := auth.ParseToken(tokenString)
		if err != nil {
			if errors.Is(err, auth.ErrInvalidClaims) {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "Invalid token claims",
				})
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "Invalid or expired token",
				})
			}
			c.Abort()
			return
		}

		c.Set("id", claims["id"])
		c.Set("role", claims["role"])

		c.Next()
	}
}
