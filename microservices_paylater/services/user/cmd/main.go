package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Paylater/services/user/internal/database"
	"Paylater/services/user/internal/db/sqlc"
	"Paylater/services/user/internal/routes"
	"Paylater/services/user/internal/utils"
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

	router.Run(":9091")
}
