package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"players_task/config"
	"players_task/db"
	"players_task/handler"
	"players_task/repository"
	"players_task/routes"
	"players_task/service"
)

func main() {

	// 1. Connect to MySQL
	sqlDB := config.ConnectDB()
	defer sqlDB.Close()

	// 2. Create sqlc queries
	queries := db.New(sqlDB)

	// 3. Create repository
	playerRepository := repository.NewPlayerRepository(
		queries,
	)

	// 4. Create service
	playerService := services.NewPlayerService(
		playerRepository,
	)

	// 5. Create handler
	playerHandler := handlers.NewPlayerHandler(
		playerService,
	)

	// 6. Create Gin router
	router := gin.Default()

	// Enable CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:5174",
			"http://localhost:5175",
			"http://localhost:5176",
			"http://localhost:5178",
		},
		AllowMethods: []string{
			"GET",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
		},
	}))

	// 7. Register API routes
	routes.RegisterPlayerRoutes(
		router,
		playerHandler,
	)

	// 8. Start server
	log.Println("Players API running on :8083")

	if err := router.Run(":8083"); err != nil {
		log.Fatal(err)
	}
}
