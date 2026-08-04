package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Paylater/services/report/internal/database"
	"Paylater/services/report/internal/db/sqlc"
	"Paylater/services/report/internal/routes"
	"Paylater/services/report/internal/utils"
)

func main() {
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
	database.Queries = sqlc.New(db)

	router := gin.Default()
	routes.SetupRoutes(router)

	router.Run(":9095")
}
