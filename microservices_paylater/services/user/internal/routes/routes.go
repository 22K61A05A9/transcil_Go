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

	router.GET("/users",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetUsers)

	router.DELETE("/users/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.DeleteUser)
}
