package handlers

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"Paylater/services/transaction/internal/clients"
	"Paylater/services/transaction/internal/db/sqlc"
	"Paylater/services/transaction/internal/models"
	"Paylater/services/transaction/internal/services"

	"github.com/gin-gonic/gin"
)

// Handler exposes HTTP handlers with an injected transaction Service.
type Handler struct {
	svc *services.Service
}

// New creates a Handler with the given Service dependency.
func New(svc *services.Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) CreateTransaction(c *gin.Context) {

	var req models.CreateTransactionRequest

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
		MerchantID: sql.NullInt32{
			Int32: req.MerchantID,
			Valid: true,
		},
		Amount: req.Amount,
	}

	err := h.svc.ProcessTransaction(c.Request.Context(), c.GetHeader("Authorization"), transaction)
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
		"message": "Transaction created successfully",
	})
}

func (h *Handler) GetTransactions(c *gin.Context) {

	transactions, err := h.svc.GetTransactions(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, transactions)
}

func (h *Handler) GetTransactionByID(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Transaction ID",
		})
		return
	}

	transaction, err := h.svc.GetTransactionByID(c.Request.Context(), int32(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Transaction not found",
		})
		return
	}

	c.JSON(http.StatusOK, transaction)
}

func (h *Handler) GetTransactionsByUser(c *gin.Context) {

	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid User ID",
		})
		return
	}

	transactions, err := h.svc.GetTransactionsByUser(c.Request.Context(), int32(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, transactions)
}

func (h *Handler) GetTransactionsByMerchant(c *gin.Context) {

	merchantID, err := strconv.Atoi(c.Param("merchant_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Merchant ID",
		})
		return
	}

	transactions, err := h.svc.GetTransactionsByMerchant(
		c.Request.Context(),
		sql.NullInt32{
			Int32: int32(merchantID),
			Valid: true,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, transactions)
}
