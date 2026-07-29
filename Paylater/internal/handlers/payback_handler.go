package handlers

import (
	"net/http"
	"Paylater/internal/db/sqlc"
	"Paylater/internal/services"
	"github.com/gin-gonic/gin"
)

type PaybackRequest struct {
	UserID int32  `json:"user_id"`
	Amount string `json:"amount"`
}

func CreatePayback(c *gin.Context) {

	var req PaybackRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	transaction := sqlc.CreateTransactionParams{
		UserID: req.UserID,
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