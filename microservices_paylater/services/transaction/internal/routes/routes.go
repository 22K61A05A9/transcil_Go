package routes

import (
	"Paylater/services/transaction/internal/handlers"
	"Paylater/services/transaction/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

	router.POST("/transactions",
		middleware.AuthMiddleware(),
		handlers.CreateTransaction)

	router.GET("/transactions/user/:user_id",
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		handlers.GetTransactionsByUser)

	router.POST("/payback",
		middleware.AuthMiddleware(),
		handlers.CreatePayback)

	router.GET("/transactions",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetTransactions)

	router.GET("/transactions/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetTransactionByID)

	router.GET("/transactions/merchant/:merchant_id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetTransactionsByMerchant)
}
