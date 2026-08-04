package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Paylater/internal/database"
	"Paylater/internal/db/sqlc"
	"Paylater/internal/routes"
	"Paylater/internal/utils"
)

func main() {
	//connect DB
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	utils.InitJWTSecret()
	db, err := database.NewDB()
	if err != nil {
		log.Fatal("cannot connect to db:", err)
	}
	database.DB = db
	//sqlc query object
	/*sqlc.New(db)  - It creates an instance of the
	generated Queries struct and binds it to the database connection.
	After that, all generated query methods
	can execute SQL using the same database connection.*/
	database.Queries = sqlc.New(db)

	router := gin.Default()

	routes.SetupRoutes(router)
	//start gin server
	router.Run(":9090")
}
