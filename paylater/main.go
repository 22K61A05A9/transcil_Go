package main
import (
	"log"
    "github.com/joho/godotenv"
	"github.com/gin-gonic/gin"

	"Paylater/internal/database"
	"Paylater/internal/db/sqlc"
	"Paylater/internal/routes"
)
func main(){
	//connect DB
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	db,err:=database.NewDB()
	if err!=nil{
		log.Fatal("cannot connect to db:",err)
	}
	database.DB=db
    //sqlc query object
	database.Queries = sqlc.New(db)

	router := gin.Default()

	routes.SetupRoutes(router)
    //start gin server
	router.Run(":9090")
}