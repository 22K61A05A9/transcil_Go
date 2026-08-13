package routes

import (
	"Paylater/services/user/internal/handlers"
	"Paylater/services/user/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, h *handlers.Handler) {

	router.GET("/health", handlers.Health)

	router.POST("/users", h.CreateUser)
	router.POST("/user/login", h.UserLogin)

	router.GET("/users/:id",
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		h.GetUserByID)

	router.PUT("/users/:id",
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		h.UpdateUser)

	// S2S: used by Transaction Service to update due after purchase/payback.
	// Not registered on the API Gateway.
	router.PUT("/users/:id/current-due",
		middleware.InternalTokenMiddleware(),
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		h.UpdateCurrentDue)

	router.GET("/users",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		h.GetUsers)

	router.DELETE("/users/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		h.DeleteUser)
}
