package routes

import (
	"Paylater/services/user/internal/handlers"
	"Paylater/services/user/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

	router.POST("/users", handlers.CreateUser)
	router.POST("/user/login", handlers.UserLogin)

	router.GET("/users/:id",
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		handlers.GetUserByID)

	router.PUT("/users/:id",
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		handlers.UpdateUser)

	// S2S: used by Transaction Service to update due after purchase/payback.
	// Not registered on the API Gateway.
	router.PUT("/users/:id/current-due",
		middleware.InternalTokenMiddleware(),
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		handlers.UpdateCurrentDue)

	router.GET("/users",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetUsers)

	router.DELETE("/users/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.DeleteUser)
}
