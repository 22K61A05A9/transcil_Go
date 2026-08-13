package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Paylater/services/gateway/internal/config"
	"Paylater/services/gateway/internal/routes"
)

func main() {
	// Optional: load .env for USER_SERVICE_URL, ADMIN_SERVICE_URL, etc.
	_ = godotenv.Load()

	cfg := config.Load()

	router := gin.Default()
	routes.SetupRoutes(router, cfg)

	log.Println("API Gateway listening on :9090")
	if err := router.Run(":9090"); err != nil {
		log.Fatal(err)
	}
}
