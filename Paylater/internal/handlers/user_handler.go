package handlers
import (
	"net/http"
	"strconv"
	"github.com/gin-gonic/gin"

	"Paylater/internal/db/sqlc"
	"Paylater/internal/services"
)
func CreateUser(c *gin.Context) {

	var user sqlc.CreateUserParams

	err := c.ShouldBindJSON(&user)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	err = services.CreateUser(user)

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

	users, err := services.GetUsers()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, users)
}
func GetUserByID(c *gin.Context) {

	id, _ := strconv.Atoi(c.Param("id"))

	user, err := services.GetUserByID(int32(id))

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, user)
}
func UpdateUser(c *gin.Context) {

	var user sqlc.UpdateUserParams

	err := c.ShouldBindJSON(&user)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	err = services.UpdateUser(user)

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

	id, _ := strconv.Atoi(c.Param("id"))

	err := services.DeleteUser(int32(id))

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