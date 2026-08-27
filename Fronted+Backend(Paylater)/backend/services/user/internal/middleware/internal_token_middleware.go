package middleware

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

const InternalTokenHeader = "X-Internal-Token"

// InternalTokenMiddleware rejects requests that do not present the shared
// INTERNAL_SERVICE_TOKEN via the X-Internal-Token header.
func InternalTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		expected := os.Getenv("INTERNAL_SERVICE_TOKEN")
		if expected == "" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "internal service token not configured",
			})
			c.Abort()
			return
		}

		if c.GetHeader(InternalTokenHeader) != expected {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "invalid internal token",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
