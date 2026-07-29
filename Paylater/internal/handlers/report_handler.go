package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"Paylater/internal/services"

	"github.com/gin-gonic/gin"
)

// Merchant Fee Collected
func GetMerchantFeeCollected(c *gin.Context) {

	merchantID, err := strconv.Atoi(c.Param("merchant_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Merchant ID",
		})
		return
	}

	totalFee, err := services.GetMerchantFeeCollected(
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

	c.JSON(http.StatusOK, gin.H{
		"total_fee": totalFee,
	})
}

// User Due
func GetUserDue(c *gin.Context) {

	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid User ID",
		})
		return
	}

	due, err := services.GetUserDue(int32(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"current_due": due,
	})
}

// Users Reached Credit Limit
func GetUsersReachedCreditLimit(c *gin.Context) {

	users, err := services.GetUsersReachedCreditLimit()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, users)
}

// Total User Due
func GetTotalUserDue(c *gin.Context) {

	totalDue, err := services.GetTotalUserDue()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_due": totalDue,
	})
}

// Customers With Due
func GetCustomersWithDue(c *gin.Context) {

	users, err := services.GetCustomersWithDue()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, users)
}