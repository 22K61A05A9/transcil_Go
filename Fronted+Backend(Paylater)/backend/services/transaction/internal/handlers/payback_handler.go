package handlers

import (
	"errors"
	"net/http"

	"Paylater/services/transaction/internal/clients"
	"Paylater/services/transaction/internal/db/sqlc"
	"Paylater/services/transaction/internal/models"

	"github.com/gin-gonic/gin"
)

func (h *Handler) CreatePayback(c *gin.Context) {

	var req models.CreatePaybackRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

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

	err := h.svc.ProcessPayback(c.Request.Context(), c.GetHeader("Authorization"), transaction)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, clients.ErrUpstreamUnavailable) {
			status = http.StatusBadGateway
		}
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Payback successful",
	})
}
