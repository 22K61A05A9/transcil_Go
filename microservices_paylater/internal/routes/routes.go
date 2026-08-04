package routes

import (
	"Paylater/internal/handlers"
	"Paylater/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

	// =====================================================
	// PUBLIC ROUTES
	// =====================================================

	// User Registration
	router.POST("/users", handlers.CreateUser)

	// Login
	router.POST("/user/login", handlers.UserLogin)
	router.POST("/merchant/login", handlers.MerchantLogin)
	router.POST("/admin/login", handlers.AdminLogin)

	// =====================================================
	// USER ROUTES
	// =====================================================

	// User Profile
	router.GET("/users/:id",
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		handlers.GetUserByID)

	router.PUT("/users/:id",
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		handlers.UpdateUser)

	// Merchant Profile
	router.GET("/merchants/:id",
		middleware.AuthMiddleware(),
		middleware.MerchantMiddleware(),
		handlers.GetMerchantByID)

	// Transactions
	router.POST("/transactions",
		middleware.AuthMiddleware(),
		handlers.CreateTransaction)

	router.GET("/transactions/user/:user_id",
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		handlers.GetTransactionsByUser)

	// Payback
	router.POST("/payback",
		middleware.AuthMiddleware(),
		handlers.CreatePayback)

	// User Due
	router.GET("/user/:user_id/due",
		middleware.AuthMiddleware(),
		middleware.UserMiddleware(),
		handlers.GetUserDue)

	// =====================================================
	// ADMIN ROUTES
	// =====================================================

	// ---------- Admin Management ----------

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

	// ---------- User Management ----------

	router.GET("/users",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.GetUsers)

	router.DELETE("/users/:id",
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		handlers.DeleteUser)

	// ---------- Merchant Management ----------

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

	// ---------- Transaction Management ----------

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

	// ---------- Reports ----------

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