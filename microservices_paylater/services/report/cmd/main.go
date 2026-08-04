package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Paylater/services/report/internal/clients"
	"Paylater/services/report/internal/config"
	"Paylater/services/report/internal/routes"
	"Paylater/services/report/internal/utils"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	utils.InitJWTSecret()

	clients.Init(config.Load())

	router := gin.Default()
	routes.SetupRoutes(router)

	router.Run(":9095")
}
