package routes
import (
	"database/sql"
	"gin_mysql_crud/handlers"
	"github.com/gin-gonic/gin"
)
func RegisterRoutes(router *gin.Engine,db *sql.DB){
	router.GET("/employees",handlers.CreateEmployee(db))
}