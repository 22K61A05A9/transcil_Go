package handlers_test

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"testing"

	"Paylater/services/merchant/internal/db/sqlc"
	"Paylater/services/merchant/internal/handlers"
	"Paylater/services/merchant/internal/routes"
	"Paylater/services/merchant/internal/services"
	"Paylater/shared/auth"

	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
)

type mockStore struct {
	emails    map[string]sqlc.CreateMerchantParams
	merchants map[int32]sqlc.Merchant
	available []sqlc.GetAvailableMerchantsRow
	availErr  error
}

func (m *mockStore) CreateMerchant(ctx context.Context, arg sqlc.CreateMerchantParams) error {
	if m.emails == nil {
		m.emails = map[string]sqlc.CreateMerchantParams{}
	}
	if _, ok := m.emails[arg.Email]; ok {
		return &mysql.MySQLError{Number: 1062, Message: "Duplicate entry"}
	}
	m.emails[arg.Email] = arg
	return nil
}

func (m *mockStore) GetMerchantByEmail(ctx context.Context, email string) (sqlc.Merchant, error) {
	return sqlc.Merchant{}, sql.ErrNoRows
}
func (m *mockStore) GetAllMerchants(ctx context.Context) ([]sqlc.Merchant, error) {
	return nil, nil
}
func (m *mockStore) GetAvailableMerchants(ctx context.Context) ([]sqlc.GetAvailableMerchantsRow, error) {
	if m.availErr != nil {
		return nil, m.availErr
	}
	if m.available == nil {
		return nil, nil
	}
	return m.available, nil
}
func (m *mockStore) GetMerchantByID(ctx context.Context, id int32) (sqlc.Merchant, error) {
	if m.merchants != nil {
		if merchant, ok := m.merchants[id]; ok {
			return merchant, nil
		}
	}
	return sqlc.Merchant{}, sql.ErrNoRows
}
func (m *mockStore) UpdateMerchant(ctx context.Context, arg sqlc.UpdateMerchantParams) error {
	if m.merchants == nil {
		return nil
	}
	merchant, ok := m.merchants[arg.ID]
	if !ok {
		return sql.ErrNoRows
	}
	merchant.MerchantName = arg.MerchantName
	merchant.PhoneNumber = arg.PhoneNumber
	m.merchants[arg.ID] = merchant
	return nil
}
func (m *mockStore) UpdateCommission(ctx context.Context, arg sqlc.UpdateCommissionParams) error {
	return nil
}
func (m *mockStore) DeleteMerchant(ctx context.Context, id int32) error { return nil }

func setupRouter(t *testing.T) *gin.Engine {
	t.Helper()
	return setupRouterWithStore(t, &mockStore{})
}

func setupRouterWithStore(t *testing.T, store services.MerchantStore) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)
	svc := services.New(store)
	h := handlers.New(svc)
	r := gin.New()
	routes.SetupMerchantRoutes(r, h)
	return r
}

func postJSON(t *testing.T, r http.Handler, path string, body any, headers map[string]string) *httptest.ResponseRecorder {
	t.Helper()
	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			t.Fatalf("encode: %v", err)
		}
	}
	req := httptest.NewRequest(http.MethodPost, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func putJSON(t *testing.T, r http.Handler, path string, body any, headers map[string]string) *httptest.ResponseRecorder {
	t.Helper()
	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			t.Fatalf("encode: %v", err)
		}
	}
	req := httptest.NewRequest(http.MethodPut, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func getJSON(t *testing.T, r http.Handler, path string, headers map[string]string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodGet, path, nil)
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestGetAvailableMerchants_PublicEmptyList(t *testing.T) {
	r := setupRouterWithStore(t, &mockStore{})
	w := getJSON(t, r, "/merchants/available", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
	if w.Body.String() != "[]" {
		t.Fatalf("expected empty JSON array [], got %q", w.Body.String())
	}
}

func TestGetAvailableMerchants_PublicProjectionOnly(t *testing.T) {
	store := &mockStore{
		available: []sqlc.GetAvailableMerchantsRow{
			{ID: 2, MerchantName: "Beta Shop"},
			{ID: 1, MerchantName: "Acme Store"},
		},
	}
	r := setupRouterWithStore(t, store)
	w := getJSON(t, r, "/merchants/available", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}

	var body []map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("unmarshal: %v body=%s", err, w.Body.String())
	}
	if len(body) != 2 {
		t.Fatalf("len=%d want=2 body=%s", len(body), w.Body.String())
	}
	for _, item := range body {
		if len(item) != 2 {
			t.Fatalf("expected only id and merchant_name keys, got %#v", item)
		}
		if _, ok := item["id"]; !ok {
			t.Fatalf("missing id: %#v", item)
		}
		if _, ok := item["merchant_name"]; !ok {
			t.Fatalf("missing merchant_name: %#v", item)
		}
		for _, forbidden := range []string{"email", "password", "phone_number", "commission_percentage"} {
			if _, ok := item[forbidden]; ok {
				t.Fatalf("sensitive field %q present: %#v", forbidden, item)
			}
		}
	}
}

func TestGetAvailableMerchants_NotCapturedByIDRoute(t *testing.T) {
	r := setupRouterWithStore(t, &mockStore{
		available: []sqlc.GetAvailableMerchantsRow{
			{ID: 7, MerchantName: "Catalog Merchant"},
		},
	})
	w := getJSON(t, r, "/merchants/available", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected public catalog 200, got %d body=%s (likely matched /merchants/:id)", w.Code, w.Body.String())
	}
	if !bytes.Contains(w.Body.Bytes(), []byte(`"merchant_name":"Catalog Merchant"`)) {
		t.Fatalf("unexpected body=%s", w.Body.String())
	}
}

func TestRegisterMerchant_SuccessWithoutAuth(t *testing.T) {
	r := setupRouter(t)
	w := postJSON(t, r, "/merchants/register", map[string]string{
		"merchant_name":         "Shop",
		"email":                 "shop@example.com",
		"password":              "secret123",
		"phone_number":          "9876543210",
		"commission_percentage": "5",
	}, nil)

	if w.Code != http.StatusCreated {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
}

func TestRegisterMerchant_CommissionBoundaries(t *testing.T) {
	r := setupRouter(t)

	cases := []struct {
		commission string
		wantStatus int
	}{
		{"3", http.StatusCreated},
		{"10", http.StatusCreated},
		{"2", http.StatusBadRequest},
		{"11", http.StatusBadRequest},
	}

	for i, tc := range cases {
		email := "boundary" + strconv.Itoa(i) + "@example.com"
		w := postJSON(t, r, "/merchants/register", map[string]string{
			"merchant_name":         "Shop",
			"email":                 email,
			"password":              "secret123",
			"commission_percentage": tc.commission,
		}, nil)
		if w.Code != tc.wantStatus {
			t.Fatalf("commission=%s status=%d want=%d body=%s",
				tc.commission, w.Code, tc.wantStatus, w.Body.String())
		}
	}
}

func TestRegisterMerchant_DuplicateEmail(t *testing.T) {
	r := setupRouter(t)
	body := map[string]string{
		"merchant_name":         "Shop",
		"email":                 "dup@example.com",
		"password":              "secret123",
		"commission_percentage": "5",
	}
	if w := postJSON(t, r, "/merchants/register", body, nil); w.Code != http.StatusCreated {
		t.Fatalf("first register: %d %s", w.Code, w.Body.String())
	}
	w := postJSON(t, r, "/merchants/register", body, nil)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("duplicate status=%d body=%s", w.Code, w.Body.String())
	}
}

func TestRegisterMerchant_MissingFields(t *testing.T) {
	r := setupRouter(t)
	w := postJSON(t, r, "/merchants/register", map[string]string{
		"merchant_name": "Shop",
	}, nil)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
}

func TestCreateMerchant_RequiresAdminJWT(t *testing.T) {
	r := setupRouter(t)
	w := postJSON(t, r, "/merchants", map[string]string{
		"merchant_name":         "Shop",
		"email":                 "admin-create@example.com",
		"password":              "secret123",
		"commission_percentage": "5",
	}, nil)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 without token, got %d body=%s", w.Code, w.Body.String())
	}
}

func TestCreateMerchant_AdminTokenAllowed(t *testing.T) {
	if err := os.Setenv("JWT_SECRET", "test-secret-admin-create"); err != nil {
		t.Fatal(err)
	}
	if err := auth.InitJWTSecret(); err != nil {
		t.Fatal(err)
	}
	token, err := auth.GenerateToken(1, "ADMIN")
	if err != nil {
		t.Fatal(err)
	}

	r := setupRouter(t)
	w := postJSON(t, r, "/merchants", map[string]string{
		"merchant_name":         "Shop",
		"email":                 "admin-create-ok@example.com",
		"password":              "secret123",
		"commission_percentage": "5",
	}, map[string]string{
		"Authorization": "Bearer " + token,
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
}

func TestUpdateMerchant_MerchantSelfAllowed(t *testing.T) {
	if err := os.Setenv("JWT_SECRET", "test-secret-merchant-self-update"); err != nil {
		t.Fatal(err)
	}
	if err := auth.InitJWTSecret(); err != nil {
		t.Fatal(err)
	}

	store := &mockStore{
		merchants: map[int32]sqlc.Merchant{
			5: {
				ID:                   5,
				MerchantName:         "Shop",
				Email:                "shop@example.com",
				PhoneNumber:          sql.NullString{String: "1111111111", Valid: true},
				CommissionPercentage: "5",
			},
		},
	}
	token, err := auth.GenerateToken(5, "merchant")
	if err != nil {
		t.Fatal(err)
	}

	r := setupRouterWithStore(t, store)
	w := putJSON(t, r, "/merchants/5", map[string]string{
		"merchant_name": "Updated Shop",
		"phone_number":  "2222222222",
	}, map[string]string{
		"Authorization": "Bearer " + token,
	})
	if w.Code != http.StatusOK {
		t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
	}
	if store.merchants[5].MerchantName != "Updated Shop" {
		t.Fatalf("merchant name not updated: %q", store.merchants[5].MerchantName)
	}
}

func TestUpdateMerchant_MerchantOtherForbidden(t *testing.T) {
	if err := os.Setenv("JWT_SECRET", "test-secret-merchant-other-denied"); err != nil {
		t.Fatal(err)
	}
	if err := auth.InitJWTSecret(); err != nil {
		t.Fatal(err)
	}

	store := &mockStore{
		merchants: map[int32]sqlc.Merchant{
			5: {ID: 5, MerchantName: "Shop", Email: "shop@example.com"},
			9: {ID: 9, MerchantName: "Other", Email: "other@example.com"},
		},
	}
	token, err := auth.GenerateToken(5, "merchant")
	if err != nil {
		t.Fatal(err)
	}

	r := setupRouterWithStore(t, store)
	w := putJSON(t, r, "/merchants/9", map[string]string{
		"merchant_name": "Hacked",
	}, map[string]string{
		"Authorization": "Bearer " + token,
	})
	if w.Code != http.StatusForbidden {
		t.Fatalf("status=%d want=%d body=%s", w.Code, http.StatusForbidden, w.Body.String())
	}
}
