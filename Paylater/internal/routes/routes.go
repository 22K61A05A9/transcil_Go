package routes
import (
	"github.com/gin-gonic/gin"

	"Paylater/internal/handlers"
)
func SetupRoutes(router *gin.Engine) {
    //user routes
	router.POST("/users", handlers.CreateUser)
	router.GET("/users", handlers.GetUsers)
	router.GET("/users/:id", handlers.GetUserByID)
	router.PUT("/users", handlers.UpdateUser)
	router.DELETE("/users/:id", handlers.DeleteUser)
	// Merchant Routes
	router.POST("/merchants", handlers.CreateMerchant)
	router.GET("/merchants", handlers.GetMerchants)
	router.GET("/merchants/:id", handlers.GetMerchantByID)
	router.PUT("/merchants/:id", handlers.UpdateMerchant)
	router.PATCH("/merchants/:id/commission", handlers.UpdateCommission)
	router.DELETE("/merchants/:id", handlers.DeleteMerchant)
	//transaction routes
	router.POST("/transactions", handlers.CreateTransaction)
	router.GET("/transactions", handlers.GetTransactions)
	router.GET("/transactions/:id", handlers.GetTransactionByID)
	router.GET("/transactions/user/:user_id", handlers.GetTransactionsByUser)
	router.GET("/transactions/merchant/:merchant_id", handlers.GetTransactionsByMerchant)
	//payback route
	router.POST("/payback", handlers.CreatePayback)
	//reports routes
	router.GET("/merchant/:merchant_id/fee", handlers.GetMerchantFeeCollected)
	router.GET("/user/:user_id/due", handlers.GetUserDue)
	router.GET("/users/credit-limit", handlers.GetUsersReachedCreditLimit)
	router.GET("/total-due", handlers.GetTotalUserDue)
	router.GET("/customers-with-due", handlers.GetCustomersWithDue)
	//login route
	router.POST("/login", handlers.Login)
}