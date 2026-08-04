package routes

import (
	"Paylater/services/merchant/internal/handlers"
	"Paylater/services/merchant/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupMerchantRoutes(router *gin.Engine) {

	// Public
	router.POST("/merchant/login", handlers.MerchantLogin)

	// Merchant profile
	router.GET("/merchants/:id",
		middleware.AuthMiddleware(),
		middleware.MerchantMiddleware(),
		handlers.GetMerchantByID)

	// Merchant management (same middleware stack as monolith)
	router.POST("/merchants",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.CreateMerchant)

	router.GET("/merchants",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetMerchants)

	router.PUT("/merchants/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.UpdateMerchant)

	router.PATCH("/merchants/:id/commission",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.UpdateCommission)

	router.DELETE("/merchants/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.DeleteMerchant)
}
