package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Paylater/services/transaction/internal/clients"
	"Paylater/services/transaction/internal/config"
	"Paylater/services/transaction/internal/database"
	"Paylater/services/transaction/internal/db/sqlc"
	"Paylater/services/transaction/internal/handlers"
	"Paylater/services/transaction/internal/routes"
	"Paylater/services/transaction/internal/services"
	"Paylater/shared/auth"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	if err := auth.InitJWTSecret(); err != nil {
		log.Fatal(err)
	}

	clients.Init(config.Load())

	db, err := database.NewDB()
	if err != nil {
		log.Fatal("cannot connect to db:", err)
	}
	defer db.Close()

	queries := sqlc.New(db)
	svc := services.New(queries)
	h := handlers.New(svc)

	router := gin.Default()
	routes.SetupRoutes(router, h)

	router.Run(":9092")
}
