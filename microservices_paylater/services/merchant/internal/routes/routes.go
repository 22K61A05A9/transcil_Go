package routes

import (
	"Paylater/services/merchant/internal/handlers"
	"Paylater/services/merchant/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupMerchantRoutes(router *gin.Engine, h *handlers.Handler) {

	router.GET("/health", handlers.Health)

	// Public
	router.POST("/merchant/login", h.MerchantLogin)

	// Merchant profile
	router.GET("/merchants/:id",
		middleware.AuthMiddleware(),
		middleware.MerchantMiddleware(),
		h.GetMerchantByID)

	// S2S: Transaction Service reads merchant commission with a user JWT.
	// Not registered on the API Gateway; does not change public /merchants/:id auth.
	router.GET("/internal/merchants/:id",
		middleware.InternalTokenMiddleware(),
		middleware.AuthMiddleware(),
		h.GetMerchantByID)

	// Merchant management (same middleware stack as monolith)
	router.POST("/merchants",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		h.CreateMerchant)

	router.GET("/merchants",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		h.GetMerchants)

	router.PUT("/merchants/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		h.UpdateMerchant)

	router.PATCH("/merchants/:id/commission",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		h.UpdateCommission)

	router.DELETE("/merchants/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		h.DeleteMerchant)
}
