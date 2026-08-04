package handlers

import (
	"net/http"

	"Paylater/services/user/internal/models"
	"Paylater/services/user/internal/services"

	"github.com/gin-gonic/gin"
)

func UserLogin(c *gin.Context) {

	var req models.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	token, err := services.UserLogin(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User Login Successful",
		"token":   token,
	})
}
