package routes

import (
	"Paylater/services/report/internal/handlers"
	"Paylater/services/report/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

	router.GET("/health", handlers.Health)

	router.GET("/user/:user_id/due",
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		handlers.GetUserDue)

	router.GET("/merchant/:merchant_id/fee",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetMerchantFeeCollected)

	router.GET("/users/credit-limit",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetUsersReachedCreditLimit)

	router.GET("/total-due",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetTotalUserDue)

	router.GET("/customers-with-due",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetCustomersWithDue)
}
