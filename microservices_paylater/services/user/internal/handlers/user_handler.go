package handlers

import (
	"net/http"
	"strconv"

	"Paylater/services/user/internal/db/sqlc"
	"Paylater/services/user/internal/models"
	"Paylater/services/user/internal/services"

	"github.com/gin-gonic/gin"
)

func CreateUser(c *gin.Context) {

	var req models.CreateUserRequest

	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	user := sqlc.CreateUserParams{
		UserName: req.UserName,
		Email:    req.Email,
		Password: req.Password,
	}

	err = services.CreateUser(c.Request.Context(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User Created Successfully",
	})
}

func GetUsers(c *gin.Context) {

	users, err := services.GetUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var response []models.UserResponse

	for _, user := range users {
		response = append(response, models.UserResponse{
			ID:          user.ID,
			UserName:    user.UserName,
			CreditLimit: user.CreditLimit,
			CurrentDue:  user.CurrentDue,
		})
	}

	c.JSON(http.StatusOK, response)
}

func GetUserByID(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid User ID",
		})
		return
	}

	user, err := services.GetUserByID(c.Request.Context(), int32(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	response := models.UserResponse{
		ID:          user.ID,
		UserName:    user.UserName,
		CreditLimit: user.CreditLimit,
		CurrentDue:  user.CurrentDue,
	}

	c.JSON(http.StatusOK, response)
}

func UpdateUser(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid User ID",
		})
		return
	}

	var req models.UpdateUserRequest

	err = c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	user := sqlc.UpdateUserParams{
		ID:       int32(id),
		UserName: req.UserName,
	}

	err = services.UpdateUser(c.Request.Context(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User Updated Successfully",
	})
}

func DeleteUser(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid User ID",
		})
		return
	}

	err = services.DeleteUser(c.Request.Context(), int32(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User Deleted Successfully",
	})
}

func UpdateCurrentDue(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid User ID",
		})
		return
	}

	var req models.UpdateCurrentDueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	err = services.UpdateCurrentDue(c.Request.Context(), sqlc.UpdateCurrentDueParams{
		ID:         int32(id),
		CurrentDue: req.CurrentDue,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Current due updated successfully",
	})
}
