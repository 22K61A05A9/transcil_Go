package handlers

import (
	"net/http"
	"strconv"

	"Paylater/services/admin/internal/db/sqlc"
	"Paylater/services/admin/internal/models"
	"Paylater/services/admin/internal/services"

	"github.com/gin-gonic/gin"
)

// Handler exposes HTTP handlers with an injected admin Service.
type Handler struct {
	svc *services.Service
}

// New creates a Handler with the given Service dependency.
func New(svc *services.Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) CreateAdmin(c *gin.Context) {

	var req models.CreateAdminRequest

	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	var role sqlc.AdminsRole

	switch req.Role {
	case "ADMIN":
		role = sqlc.AdminsRoleADMIN
	case "SUPER_ADMIN":
		role = sqlc.AdminsRoleSUPERADMIN
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid role. Use ADMIN or SUPER_ADMIN",
		})
		return
	}

	admin := sqlc.CreateAdminParams{
		AdminName: req.AdminName,
		Email:     req.Email,
		Password:  req.Password,
		Role:      role,
	}

	err = h.svc.CreateAdmin(c.Request.Context(), admin)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Admin created successfully",
	})
}

func (h *Handler) GetAdmins(c *gin.Context) {

	admins, err := h.svc.GetAdmins(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var response []models.AdminResponse

	for _, admin := range admins {
		response = append(response, models.AdminResponse{
			ID:        admin.ID,
			AdminName: admin.AdminName,
			Email:     admin.Email,
			Role:      string(admin.Role),
		})
	}

	c.JSON(http.StatusOK, response)
}

func (h *Handler) GetAdminByID(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Admin ID",
		})
		return
	}

	admin, err := h.svc.GetAdminByID(c.Request.Context(), int32(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	response := models.AdminResponse{
		ID:        admin.ID,
		AdminName: admin.AdminName,
		Email:     admin.Email,
		Role:      string(admin.Role),
	}

	c.JSON(http.StatusOK, response)
}

func (h *Handler) DeleteAdmin(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Admin ID",
		})
		return
	}

	err = h.svc.DeleteAdmin(c.Request.Context(), int32(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Admin deleted successfully",
	})
}
