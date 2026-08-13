package handlers
import (
	"net/http"
	"strconv"

	"Paylater/internal/db/sqlc"
	"Paylater/internal/services"

	"github.com/gin-gonic/gin"
)

// Create Merchant
func CreateMerchant(c *gin.Context) {

	var merchant sqlc.CreateMerchantParams

	if err := c.ShouldBindJSON(&merchant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
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

	c.JSON(http.StatusOK, merchants)
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

	c.JSON(http.StatusOK, merchant)
}

// Update Merchant
func UpdateMerchant(c *gin.Context) {

	var merchant sqlc.UpdateMerchantParams

	if err := c.ShouldBindJSON(&merchant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	err := services.UpdateMerchant(merchant)

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