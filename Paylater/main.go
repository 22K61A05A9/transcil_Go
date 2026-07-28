package main
import (
	"log"

	"github.com/gin-gonic/gin"

	"Paylater/internal/database"
	"Paylater/internal/db/sqlc"
	"Paylater/internal/routes"
)
func main(){
	//connect DB
	db,err:=database.NewDB()
	if err!=nil{
		log.Fatal("cannot connect to db:",err)
	}
	database.DB=db

	database.Queries = sqlc.New(db)

	router := gin.Default()

	routes.SetupRoutes(router)

	router.Run(":9090")
}