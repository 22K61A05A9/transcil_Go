package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"Paylater/services/transaction/internal/middleware"
	"Paylater/shared/auth"

	"github.com/gin-gonic/gin"
)

func setupMerchantMW(t *testing.T) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)

	if err := os.Setenv("JWT_SECRET", "test-secret-merchant-tx-mw"); err != nil {
		t.Fatal(err)
	}
	if err := auth.InitJWTSecret(); err != nil {
		t.Fatal(err)
	}

	r := gin.New()
	r.GET("/transactions/merchant/:merchant_id",
		middleware.AuthMiddleware(),
		middleware.MerchantMiddleware(),
		func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"ok": true})
		},
	)
	return r
}

func getWithToken(t *testing.T, r http.Handler, path, token string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodGet, path, nil)
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestMerchantMiddleware_OwnMerchantAllowed(t *testing.T) {
	r := setupMerchantMW(t)
	token, err := auth.GenerateToken(7, "merchant")
	if err != nil {
		t.Fatal(err)
	}
	w := getWithToken(t, r, "/transactions/merchant/7", token)
	if w.Code != http.StatusOK {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
}

func TestMerchantMiddleware_OtherMerchantForbidden(t *testing.T) {
	r := setupMerchantMW(t)
	token, err := auth.GenerateToken(7, "merchant")
	if err != nil {
		t.Fatal(err)
	}
	w := getWithToken(t, r, "/transactions/merchant/8", token)
	if w.Code != http.StatusForbidden {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
}

func TestMerchantMiddleware_UserRoleForbidden(t *testing.T) {
	r := setupMerchantMW(t)
	token, err := auth.GenerateToken(7, "user")
	if err != nil {
		t.Fatal(err)
	}
	w := getWithToken(t, r, "/transactions/merchant/7", token)
	if w.Code != http.StatusForbidden {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
}

func TestMerchantMiddleware_AdminAllowed(t *testing.T) {
	r := setupMerchantMW(t)
	token, err := auth.GenerateToken(1, "ADMIN")
	if err != nil {
		t.Fatal(err)
	}
	w := getWithToken(t, r, "/transactions/merchant/99", token)
	if w.Code != http.StatusOK {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
}

func TestMerchantMiddleware_Unauthenticated(t *testing.T) {
	r := setupMerchantMW(t)
	w := getWithToken(t, r, "/transactions/merchant/7", "")
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
}
