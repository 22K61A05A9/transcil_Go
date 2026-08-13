package services

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"Paylater/services/merchant/internal/db/sqlc"

	"Paylater/shared/auth"

	"github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

type mockStore struct {
	createErr   error
	created     []sqlc.CreateMerchantParams
	byEmail     map[string]sqlc.Merchant
	createCalls int
}

func (m *mockStore) CreateMerchant(ctx context.Context, arg sqlc.CreateMerchantParams) error {
	m.createCalls++
	if m.createErr != nil {
		return m.createErr
	}
	if m.byEmail == nil {
		m.byEmail = map[string]sqlc.Merchant{}
	}
	if _, exists := m.byEmail[arg.Email]; exists {
		return &mysql.MySQLError{Number: 1062, Message: "Duplicate entry"}
	}
	m.created = append(m.created, arg)
	m.byEmail[arg.Email] = sqlc.Merchant{
		ID:                   int32(len(m.created)),
		MerchantName:         arg.MerchantName,
		Email:                arg.Email,
		Password:             arg.Password,
		PhoneNumber:          arg.PhoneNumber,
		CommissionPercentage: arg.CommissionPercentage,
	}
	return nil
}

func (m *mockStore) GetMerchantByEmail(ctx context.Context, email string) (sqlc.Merchant, error) {
	if m.byEmail == nil {
		return sqlc.Merchant{}, sql.ErrNoRows
	}
	merchant, ok := m.byEmail[email]
	if !ok {
		return sqlc.Merchant{}, sql.ErrNoRows
	}
	return merchant, nil
}

func (m *mockStore) GetAllMerchants(ctx context.Context) ([]sqlc.Merchant, error) {
	return nil, nil
}
func (m *mockStore) GetAvailableMerchants(ctx context.Context) ([]sqlc.GetAvailableMerchantsRow, error) {
	return nil, nil
}
func (m *mockStore) GetMerchantByID(ctx context.Context, id int32) (sqlc.Merchant, error) {
	return sqlc.Merchant{}, sql.ErrNoRows
}
func (m *mockStore) UpdateMerchant(ctx context.Context, arg sqlc.UpdateMerchantParams) error {
	return nil
}
func (m *mockStore) UpdateCommission(ctx context.Context, arg sqlc.UpdateCommissionParams) error {
	return nil
}
func (m *mockStore) DeleteMerchant(ctx context.Context, id int32) error { return nil }

func validParams(commission string) sqlc.CreateMerchantParams {
	return sqlc.CreateMerchantParams{
		MerchantName:         "Test Merchant",
		Email:                "merchant@example.com",
		Password:             "secret123",
		PhoneNumber:          sql.NullString{String: "9876543210", Valid: true},
		CommissionPercentage: commission,
	}
}

func TestCreateMerchant_CommissionBoundaries(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		commission string
		wantErr    error
	}{
		{name: "commission 3 accepted", commission: "3", wantErr: nil},
		{name: "commission 10 accepted", commission: "10", wantErr: nil},
		{name: "commission 7 accepted", commission: "7", wantErr: nil},
		{name: "commission 2 rejected", commission: "2", wantErr: ErrCommissionOutOfRange},
		{name: "commission 11 rejected", commission: "11", wantErr: ErrCommissionOutOfRange},
		{name: "commission invalid rejected", commission: "abc", wantErr: ErrInvalidCommissionPercentage},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			store := &mockStore{}
			svc := New(store)
			err := svc.CreateMerchant(context.Background(), validParams(tt.commission))
			if tt.wantErr == nil {
				if err != nil {
					t.Fatalf("expected success, got %v", err)
				}
				if store.createCalls != 1 {
					t.Fatalf("expected create call, got %d", store.createCalls)
				}
				return
			}
			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("expected %v, got %v", tt.wantErr, err)
			}
			if store.createCalls != 0 {
				t.Fatalf("expected no create call on validation failure")
			}
		})
	}
}

func TestCreateMerchant_HashesPasswordAndPersists(t *testing.T) {
	t.Parallel()

	store := &mockStore{}
	svc := New(store)
	params := validParams("5")

	if err := svc.CreateMerchant(context.Background(), params); err != nil {
		t.Fatalf("CreateMerchant: %v", err)
	}
	if len(store.created) != 1 {
		t.Fatalf("expected 1 created merchant")
	}
	stored := store.created[0]
	if stored.Password == "secret123" {
		t.Fatal("password was not hashed")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(stored.Password), []byte("secret123")); err != nil {
		t.Fatalf("stored hash does not match password: %v", err)
	}
}

func TestCreateMerchant_DuplicateEmail(t *testing.T) {
	t.Parallel()

	store := &mockStore{}
	svc := New(store)
	params := validParams("5")

	if err := svc.CreateMerchant(context.Background(), params); err != nil {
		t.Fatalf("first create: %v", err)
	}
	err := svc.CreateMerchant(context.Background(), params)
	if !errors.Is(err, ErrDuplicateEmail) {
		t.Fatalf("expected ErrDuplicateEmail, got %v", err)
	}
}

func TestMerchantLogin_AfterCreate(t *testing.T) {
	store := &mockStore{}
	svc := New(store)
	params := validParams("5")
	params.Email = "login-after-register@example.com"

	if err := svc.CreateMerchant(context.Background(), params); err != nil {
		t.Fatalf("create: %v", err)
	}

	// JWT secret required by auth package for GenerateToken.
	t.Setenv("JWT_SECRET", "test-secret-for-merchant-login")
	if err := auth.InitJWTSecret(); err != nil {
		t.Fatalf("init jwt: %v", err)
	}

	token, err := svc.MerchantLogin(context.Background(), params.Email, "secret123")
	if err != nil {
		t.Fatalf("MerchantLogin: %v", err)
	}
	if token == "" {
		t.Fatal("expected non-empty token")
	}
}
