package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Paylater/services/merchant/internal/database"
	"Paylater/services/merchant/internal/db/sqlc"
	"Paylater/services/merchant/internal/routes"
	"Paylater/services/merchant/internal/utils"
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
	routes.SetupMerchantRoutes(router)

	router.Run(":9094")
}
