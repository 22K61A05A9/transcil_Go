package main
import (
	//"context"
	"database/sql"
	"log"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gin-gonic/gin"
	db "employee_api/db/generated"
)
func main() {
	dsn:="gouser:Go@123@tcp(localhost:3306)/employee_db"
	dbConn,err:=sql.Open("mysql",dsn)
	if err!=nil{
		log.Fatal("Error while connecting to DB",err)
	}
	err=dbConn.Ping()
	if err!=nil{
		log.Fatal("Error while pinging DB", err)
	}
	queries:=db.New(dbConn)
	_=queries
	router := gin.Default()
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "DB connected",
		})
	})
	router.Run(":6080")
}