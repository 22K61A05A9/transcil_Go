package middleware

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func UserMiddleware() gin.HandlerFunc {

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

		// Admins can access any user
		if roleStr == "ADMIN" || roleStr == "SUPER_ADMIN" {
			c.Next()
			return
		}

		idValue, exists := c.Get("id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User ID not found in token",
			})
			c.Abort()
			return
		}

		tokenID := int(idValue.(float64))

		// Support both :id and :user_id
		param := c.Param("id")
		if param == "" {
			param = c.Param("user_id")
		}

		paramID, err := strconv.Atoi(param)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid User ID",
			})
			c.Abort()
			return
		}

		if tokenID != paramID {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "You can only access your own profile",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
