package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"Paylater/services/merchant/internal/db/sqlc"
	"Paylater/services/merchant/internal/models"
	"Paylater/services/merchant/internal/services"

	"github.com/gin-gonic/gin"
)

// Handler exposes HTTP handlers with an injected merchant Service.
type Handler struct {
	svc *services.Service
}

// New creates a Handler with the given Service dependency.
func New(svc *services.Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) CreateMerchant(c *gin.Context) {

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

	err := h.svc.CreateMerchant(c.Request.Context(), merchant)
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

func (h *Handler) GetMerchants(c *gin.Context) {

	merchants, err := h.svc.GetMerchants(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var response []models.MerchantResponse

	for _, merchant := range merchants {

		response = append(response, models.MerchantResponse{
			ID:                   merchant.ID,
			MerchantName:         merchant.MerchantName,
			Email:                merchant.Email,
			PhoneNumber:          merchant.PhoneNumber.String,
			CommissionPercentage: merchant.CommissionPercentage,
		})
	}

	c.JSON(http.StatusOK, response)
}

func (h *Handler) GetMerchantByID(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Merchant ID",
		})
		return
	}

	merchant, err := h.svc.GetMerchantByID(c.Request.Context(), int32(id))
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

func (h *Handler) UpdateMerchant(c *gin.Context) {

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

	err = h.svc.UpdateMerchant(c.Request.Context(), merchant)
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

func (h *Handler) UpdateCommission(c *gin.Context) {

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

	err = h.svc.UpdateCommission(c.Request.Context(), merchant)
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

func (h *Handler) DeleteMerchant(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Merchant ID",
		})
		return
	}

	err = h.svc.DeleteMerchant(c.Request.Context(), int32(id))
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
