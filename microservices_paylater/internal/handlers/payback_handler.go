package handlers

import (
	"net/http"

	"Paylater/internal/db/sqlc"
	"Paylater/internal/models"
	"Paylater/internal/services"

	"github.com/gin-gonic/gin"
)

func CreatePayback(c *gin.Context) {

	var req models.CreatePaybackRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Get logged-in user ID from JWT
	userIDValue, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User ID not found in token",
		})
		return
	}

	userIDFloat, ok := userIDValue.(float64)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid User ID",
		})
		return
	}

	transaction := sqlc.CreateTransactionParams{
		UserID: int32(userIDFloat),
		Amount: req.Amount,
	}

	err := services.ProcessPayback(transaction)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Payback successful",
	})
}