package routes

import (
	"net/http"

	"Paylater/services/gateway/internal/config"
	"Paylater/services/gateway/internal/proxy"

	"github.com/gin-gonic/gin"
)

// SetupRoutes registers path-based reverse proxies to microservices.
// More specific paths are registered before parameterized paths.
func SetupRoutes(router *gin.Engine, cfg config.Config) {
	// Gateway process liveness (not proxied upstream).
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	user := proxy.Forward(cfg.UserServiceURL)
	transaction := proxy.Forward(cfg.TransactionServiceURL)
	admin := proxy.Forward(cfg.AdminServiceURL)
	merchant := proxy.Forward(cfg.MerchantServiceURL)
	report := proxy.Forward(cfg.ReportServiceURL)

	// ---------- Report (before /users/:id and other overlaps) ----------
	router.GET("/users/credit-limit", report)
	router.GET("/user/:user_id/due", report)
	router.GET("/merchant/:merchant_id/fee", report)
	router.GET("/total-due", report)
	router.GET("/customers-with-due", report)

	// ---------- Admin ----------
	router.POST("/admin/login", admin)
	router.POST("/admins", admin)
	router.GET("/admins", admin)
	router.GET("/admins/:id", admin)
	router.DELETE("/admins/:id", admin)

	// ---------- Merchant ----------
	router.POST("/merchant/login", merchant)
	router.GET("/merchants/:id", merchant)
	router.POST("/merchants", merchant)
	router.GET("/merchants", merchant)
	router.PUT("/merchants/:id", merchant)
	router.PATCH("/merchants/:id/commission", merchant)
	router.DELETE("/merchants/:id", merchant)

	// ---------- User ----------
	router.POST("/users", user)
	router.POST("/user/login", user)
	router.GET("/users", user)
	router.GET("/users/:id", user)
	router.PUT("/users/:id", user)
	router.DELETE("/users/:id", user)

	// ---------- Transaction (specific paths before /transactions/:id) ----------
	router.POST("/transactions", transaction)
	router.GET("/transactions/user/:user_id", transaction)
	router.POST("/payback", transaction)
	router.GET("/transactions", transaction)
	router.GET("/transactions/merchant/:merchant_id", transaction)
	router.GET("/transactions/:id", transaction)
}
