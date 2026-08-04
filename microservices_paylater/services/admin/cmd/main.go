package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Paylater/services/admin/internal/database"
	"Paylater/services/admin/internal/db/sqlc"
	"Paylater/services/admin/internal/routes"
	"Paylater/services/admin/internal/utils"
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
	routes.SetupAdminRoutes(router)

	router.Run(":9093")
}
