package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"Paylater/services/report/internal/clients"
	"Paylater/services/report/internal/services"

	"github.com/gin-gonic/gin"
)

func writeServiceError(c *gin.Context, err error, fallbackStatus int) {
	status := fallbackStatus
	if errors.Is(err, clients.ErrUpstreamUnavailable) {
		status = http.StatusBadGateway
	}
	c.JSON(status, gin.H{"error": err.Error()})
}

func GetMerchantFeeCollected(c *gin.Context) {

	merchantID, err := strconv.Atoi(c.Param("merchant_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Merchant ID",
		})
		return
	}

	totalFee, err := services.GetMerchantFeeCollected(
		c.Request.Context(),
		c.GetHeader("Authorization"),
		int32(merchantID),
	)
	if err != nil {
		writeServiceError(c, err, http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_fee": totalFee,
	})
}

func GetUserDue(c *gin.Context) {

	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid User ID",
		})
		return
	}

	due, err := services.GetUserDue(
		c.Request.Context(),
		c.GetHeader("Authorization"),
		int32(userID),
	)
	if err != nil {
		writeServiceError(c, err, http.StatusNotFound)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"current_due": due,
	})
}

func GetUsersReachedCreditLimit(c *gin.Context) {

	response, err := services.GetUsersReachedCreditLimit(
		c.Request.Context(),
		c.GetHeader("Authorization"),
	)
	if err != nil {
		writeServiceError(c, err, http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, response)
}

func GetTotalUserDue(c *gin.Context) {

	totalDue, err := services.GetTotalUserDue(
		c.Request.Context(),
		c.GetHeader("Authorization"),
	)
	if err != nil {
		writeServiceError(c, err, http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_due": totalDue,
	})
}

func GetCustomersWithDue(c *gin.Context) {

	response, err := services.GetCustomersWithDue(
		c.Request.Context(),
		c.GetHeader("Authorization"),
	)
	if err != nil {
		writeServiceError(c, err, http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, response)
}
