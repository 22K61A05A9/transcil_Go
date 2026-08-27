package routes

import (
	"Paylater/services/admin/internal/handlers"
	"Paylater/services/admin/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupAdminRoutes(router *gin.Engine, h *handlers.Handler) {

	router.GET("/health", handlers.Health)

	// Public
	router.POST("/admin/login", h.AdminLogin)

	// Admin management — create is SUPER_ADMIN only (JWT role, not request body)
	router.POST("/admins",
		middleware.AuthMiddleware(),
		middleware.SuperAdminMiddleware(),
		h.CreateAdmin)

	router.GET("/admins",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		h.GetAdmins)

	router.GET("/admins/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		h.GetAdminByID)

	router.DELETE("/admins/:id",
		middleware.AuthMiddleware(),
		middleware.SuperAdminMiddleware(),
		h.DeleteAdmin)
}
