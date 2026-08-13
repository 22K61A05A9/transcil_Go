package routes

import (
	"database/sql"
	"gin_mysql_crud/handlers"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, db *sql.DB) {
	router.POST("/employees", handlers.CreateEmployee(db))
	router.GET("/employees", handlers.GetEmployees(db))
	router.GET("/employees/:id", handlers.GetEmployeeById(db))
	router.PUT("/employees/:id", handlers.UpdateEmployee(db))
	router.DELETE("/employees/:id", handlers.DeleteEmployee(db))
}
