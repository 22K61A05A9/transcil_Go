package handlers

import (
	"net/http"

	"Paylater/services/admin/internal/models"
	"Paylater/services/admin/internal/services"

	"github.com/gin-gonic/gin"
)

func AdminLogin(c *gin.Context) {

	var req models.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	token, err := services.AdminLogin(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Admin Login Successful",
		"token":   token,
	})
}
