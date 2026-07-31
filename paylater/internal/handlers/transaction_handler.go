package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"Paylater/internal/db/sqlc"
	"Paylater/internal/models"
	"Paylater/internal/services"

	"github.com/gin-gonic/gin"
)

// Create Purchase Transaction
func CreateTransaction(c *gin.Context) {

	var req models.CreateTransactionRequest

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
		MerchantID: sql.NullInt32{
			Int32: req.MerchantID,
			Valid: true,
		},
		Amount: req.Amount,
	}

	err := services.ProcessTransaction(transaction)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Transaction created successfully",
	})
}

// Get All Transactions
func GetTransactions(c *gin.Context) {

	transactions, err := services.GetTransactions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, transactions)
}

// Get Transaction By ID
func GetTransactionByID(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Transaction ID",
		})
		return
	}

	transaction, err := services.GetTransactionByID(int32(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Transaction not found",
		})
		return
	}

	c.JSON(http.StatusOK, transaction)
}

// Get Transactions By User
func GetTransactionsByUser(c *gin.Context) {

	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid User ID",
		})
		return
	}

	transactions, err := services.GetTransactionsByUser(int32(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, transactions)
}

// Get Transactions By Merchant
func GetTransactionsByMerchant(c *gin.Context) {

	merchantID, err := strconv.Atoi(c.Param("merchant_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Merchant ID",
		})
		return
	}

	transactions, err := services.GetTransactionsByMerchant(
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