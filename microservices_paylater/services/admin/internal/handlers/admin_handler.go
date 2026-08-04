package handlers

import (
	"net/http"
	"strconv"

	"Paylater/services/admin/internal/db/sqlc"
	"Paylater/services/admin/internal/models"
	"Paylater/services/admin/internal/services"

	"github.com/gin-gonic/gin"
)

// Create Admin
func CreateAdmin(c *gin.Context) {

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

	err = services.CreateAdmin(c.Request.Context(), admin)
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

// Get All Admins
func GetAdmins(c *gin.Context) {

	admins, err := services.GetAdmins(c.Request.Context())
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

// Get Admin By ID
func GetAdminByID(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Admin ID",
		})
		return
	}

	admin, err := services.GetAdminByID(c.Request.Context(), int32(id))
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

// Delete Admin
func DeleteAdmin(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Admin ID",
		})
		return
	}

	err = services.DeleteAdmin(c.Request.Context(), int32(id))
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
