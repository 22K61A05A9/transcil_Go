package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Paylater/services/user/internal/database"
	"Paylater/services/user/internal/db/sqlc"
	"Paylater/services/user/internal/handlers"
	"Paylater/services/user/internal/routes"
	"Paylater/services/user/internal/services"
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
	routes.SetupRoutes(router, h)

	router.Run(":9091")
}
