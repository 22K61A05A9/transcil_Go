package routes

import (
	"Paylater/services/transaction/internal/handlers"
	"Paylater/services/transaction/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, h *handlers.Handler) {

	router.GET("/health", handlers.Health)

	router.POST("/transactions",
		middleware.AuthMiddleware(),
		h.CreateTransaction)

	router.GET("/transactions/user/:user_id",
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		h.GetTransactionsByUser)

	router.POST("/payback",
		middleware.AuthMiddleware(),
		h.CreatePayback)

	router.GET("/transactions",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		h.GetTransactions)

	router.GET("/transactions/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		h.GetTransactionByID)

	router.GET("/transactions/merchant/:merchant_id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		h.GetTransactionsByMerchant)
}
