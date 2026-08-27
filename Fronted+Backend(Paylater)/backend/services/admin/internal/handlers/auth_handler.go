package handlers

import (
	"net/http"

	"Paylater/services/admin/internal/models"

	"github.com/gin-gonic/gin"
)

func (h *Handler) AdminLogin(c *gin.Context) {

	var req models.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	token, err := h.svc.AdminLogin(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Admin Login Successful",
		"token":   token,
	})
}
