package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Paylater/services/admin/internal/database"
	"Paylater/services/admin/internal/db/sqlc"
	"Paylater/services/admin/internal/handlers"
	"Paylater/services/admin/internal/routes"
	"Paylater/services/admin/internal/services"
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
	routes.SetupAdminRoutes(router, h)

	router.Run(":9093")
}
