package handlers

import (
	"database/sql"
	"net/http"
	"gin_mysql_crud/models"
	"github.com/gin-gonic/gin"
)
func CreateEmployee(db *sql.DB) gin.HandlerFunc{
	return func(c *gin.Context){
		var emp models.Employee
		err:=c.BindJSON(&emp)
		if err!=nil{
			c.JSON(http.StatusBadRequest,gin.H{"error":err.Error()})
			return
		}
		result, err := db.Exec(
		"INSERT INTO employees(name, salary) VALUES(?, ?)",
		emp.Name,
		emp.Salary,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		id, err := result.LastInsertId()
		if err!=nil{
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":err.Error(),
			})
			return
		}
		emp.ID=int(id)
		c.JSON(http.StatusCreated, gin.H{
			"message":"Employee created successfully",
			"id":id,
		})
	}
}