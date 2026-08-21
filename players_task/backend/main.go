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

	// ========================================================
	// 1. CONNECT TO MYSQL
	// ========================================================

	sqlDB := config.ConnectDB()
	defer sqlDB.Close()

	// ========================================================
	// 2. CREATE SQLC QUERIES
	// ========================================================

	queries := db.New(sqlDB)

	// ========================================================
	// 3. CREATE REPOSITORY
	// ========================================================

	playerRepository := repository.NewPlayerRepository(
		queries,
	)

	// ========================================================
	// 4. CREATE SERVICE
	// ========================================================

	playerService := services.NewPlayerService(
		playerRepository,
	)

	// ========================================================
	// 5. CREATE HANDLER
	// ========================================================

	playerHandler := handlers.NewPlayerHandler(
		playerService,
	)

	// ========================================================
	// 6. CREATE GIN ROUTER
	// ========================================================

	router := gin.Default()

	// ========================================================
	// 7. ENABLE CORS
	// ========================================================

	router.Use(cors.New(cors.Config{

		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:5174",
			"http://localhost:5175",
		},

		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},

		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
		},

		AllowCredentials: true,
	}))

	// ========================================================
	// 8. REGISTER API ROUTES
	// ========================================================

	routes.RegisterPlayerRoutes(
		router,
		playerHandler,
	)

	// ========================================================
	// 9. START SERVER
	// ========================================================

	log.Println(
		"Players API running on :8081",
	)

	if err := router.Run(":8081"); err != nil {
		log.Fatal(err)
	}
}
