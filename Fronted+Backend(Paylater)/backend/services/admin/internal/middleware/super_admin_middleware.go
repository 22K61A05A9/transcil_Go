package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// SuperAdminMiddleware allows only callers whose JWT role claim is SUPER_ADMIN.
// Authorization uses the authenticated role from Gin context (set by AuthMiddleware),
// never a role value from the request body.
func SuperAdminMiddleware() gin.HandlerFunc {
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

		if roleStr != "SUPER_ADMIN" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Access denied. Super admin privileges required.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
