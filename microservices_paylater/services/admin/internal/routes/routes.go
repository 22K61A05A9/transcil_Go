package routes

import (
	"Paylater/services/admin/internal/handlers"
	"Paylater/services/admin/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupAdminRoutes(router *gin.Engine) {

	// Public
	router.POST("/admin/login", handlers.AdminLogin)

	// Admin management
	router.POST("/admins",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.CreateAdmin)

	router.GET("/admins",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetAdmins)

	router.GET("/admins/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetAdminByID)

	router.DELETE("/admins/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.DeleteAdmin)
}
