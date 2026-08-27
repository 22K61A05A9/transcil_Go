package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func AdminMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Role not found",
			})
			c.Abort()
			return
		}

		roleStr, ok := role.(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid role",
			})
			c.Abort()
			return
		}

		// Allow both ADMIN and SUPER_ADMIN
		if roleStr != "ADMIN" && roleStr != "SUPER_ADMIN" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Access denied. Admin privileges required.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
