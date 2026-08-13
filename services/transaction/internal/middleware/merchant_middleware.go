package middleware

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// MerchantMiddleware allows ADMIN/SUPER_ADMIN any merchant_id, or a merchant JWT
// only when the path :merchant_id matches the token id.
func MerchantMiddleware() gin.HandlerFunc {
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

		if roleStr == "ADMIN" || roleStr == "SUPER_ADMIN" {
			c.Next()
			return
		}

		if roleStr != "merchant" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Access denied. Merchant privileges required.",
			})
			c.Abort()
			return
		}

		idValue, exists := c.Get("id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Merchant ID not found in token",
			})
			c.Abort()
			return
		}

		tokenID := int(idValue.(float64))

		param := c.Param("merchant_id")
		if param == "" {
			param = c.Param("id")
		}

		paramID, err := strconv.Atoi(param)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid Merchant ID",
			})
			c.Abort()
			return
		}

		if tokenID != paramID {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "You can only access your own transactions",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
