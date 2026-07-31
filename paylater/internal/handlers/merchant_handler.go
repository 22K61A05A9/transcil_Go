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

// Create Merchant
func CreateMerchant(c *gin.Context) {

	var req models.CreateMerchantRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	merchant := sqlc.CreateMerchantParams{
		MerchantName: req.MerchantName,
		Email:        req.Email,
		Password:     req.Password,
		PhoneNumber: sql.NullString{
			String: req.PhoneNumber,
			Valid:  req.PhoneNumber != "",
		},
		CommissionPercentage: req.CommissionPercentage,
	}

	err := services.CreateMerchant(merchant)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Merchant created successfully",
	})
}

// Get All Merchants
func GetMerchants(c *gin.Context) {

	merchants, err := services.GetMerchants()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var response []models.MerchantResponse

	for _, merchant := range merchants {

		response = append(response, models.MerchantResponse{
			ID:                     merchant.ID,
			MerchantName:           merchant.MerchantName,
			Email:                  merchant.Email,
			PhoneNumber:            merchant.PhoneNumber.String,
			CommissionPercentage:   merchant.CommissionPercentage,
		})
	}

	c.JSON(http.StatusOK, response)
}

// Get Merchant By ID
func GetMerchantByID(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Merchant ID",
		})
		return
	}

	merchant, err := services.GetMerchantByID(int32(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	response := models.MerchantResponse{
		ID:                   merchant.ID,
		MerchantName:         merchant.MerchantName,
		Email:                merchant.Email,
		PhoneNumber:          merchant.PhoneNumber.String,
		CommissionPercentage: merchant.CommissionPercentage,
	}

	c.JSON(http.StatusOK, response)
}

// Update Merchant
func UpdateMerchant(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Merchant ID",
		})
		return
	}

	var req models.UpdateMerchantRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	merchant := sqlc.UpdateMerchantParams{
		ID:           int32(id),
		MerchantName: req.MerchantName,
		PhoneNumber: sql.NullString{
			String: req.PhoneNumber,
			Valid:  req.PhoneNumber != "",
		},
	}

	err = services.UpdateMerchant(merchant)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Merchant updated successfully",
	})
}

// Update Commission
func UpdateCommission(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Merchant ID",
		})
		return
	}

	var merchant sqlc.UpdateCommissionParams

	if err := c.ShouldBindJSON(&merchant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	merchant.ID = int32(id)

	err = services.UpdateCommission(merchant)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Commission updated successfully",
	})
}

// Delete Merchant
func DeleteMerchant(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Merchant ID",
		})
		return
	}

	err = services.DeleteMerchant(int32(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Merchant deleted successfully",
	})
}