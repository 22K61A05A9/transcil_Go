package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Paylater/services/merchant/internal/database"
	"Paylater/services/merchant/internal/db/sqlc"
	"Paylater/services/merchant/internal/handlers"
	"Paylater/services/merchant/internal/routes"
	"Paylater/services/merchant/internal/services"
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

	db, err := database.NewDB()
	if err != nil {
		log.Fatal("cannot connect to db:", err)
	}
	defer db.Close()

	queries := sqlc.New(db)
	svc := services.New(queries)
	h := handlers.New(svc)

	router := gin.Default()
	routes.SetupMerchantRoutes(router, h)

	router.Run(":9094")
}
