package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Paylater/services/transaction/internal/clients"
	"Paylater/services/transaction/internal/config"
	"Paylater/services/transaction/internal/database"
	"Paylater/services/transaction/internal/db/sqlc"
	"Paylater/services/transaction/internal/routes"
	"Paylater/services/transaction/internal/utils"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	utils.InitJWTSecret()

	clients.Init(config.Load())

	db, err := database.NewDB()
	if err != nil {
		log.Fatal("cannot connect to db:", err)
	}
	database.DB = db
	database.Queries = sqlc.New(db)

	router := gin.Default()
	routes.SetupRoutes(router)

	router.Run(":9092")
}
