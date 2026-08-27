package services

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"Paylater/services/transaction/internal/clients"
	"Paylater/services/transaction/internal/db/sqlc"
)

type mockUserGateway struct {
	user          clients.UserDTO
	getErr        error
	updateErrs    []error // sequential errors for UpdateCurrentDue calls
	updateCalls   []string
	updateCallIdx int
}

func (m *mockUserGateway) GetUserByID(ctx context.Context, authHeader string, id int32) (clients.UserDTO, error) {
	if m.getErr != nil {
		return clients.UserDTO{}, m.getErr
	}
	return m.user, nil
}

func (m *mockUserGateway) UpdateCurrentDue(ctx context.Context, authHeader string, id int32, currentDue string) error {
	m.updateCalls = append(m.updateCalls, currentDue)
	if m.updateCallIdx < len(m.updateErrs) {
		err := m.updateErrs[m.updateCallIdx]
		m.updateCallIdx++
		return err
	}
	m.updateCallIdx++
	return nil
}

type mockMerchantGateway struct {
	merchant clients.MerchantDTO
	err      error
}

func (m *mockMerchantGateway) GetMerchantByID(ctx context.Context, authHeader string, id int32) (clients.MerchantDTO, error) {
	if m.err != nil {
		return clients.MerchantDTO{}, m.err
	}
	return m.merchant, nil
}

type mockWriter struct {
	err     error
	called  bool
	lastArg sqlc.CreateTransactionParams
}

func (m *mockWriter) CreateTransaction(ctx context.Context, arg sqlc.CreateTransactionParams) error {
	m.called = true
	m.lastArg = arg
	return m.err
}

func newTestService(users userGateway, merchants merchantGateway, writer transactionWriter) *Service {
	return &Service{
		users:     users,
		merchants: merchants,
		writer:    writer,
	}
}

func merchantID(id int32) sql.NullInt32 {
	return sql.NullInt32{Int32: id, Valid: true}
}

func TestProcessTransaction_UserUpdateFails_NoLocalWrite(t *testing.T) {
	users := &mockUserGateway{
		user: clients.UserDTO{
			ID: 1, CreditLimit: "2000.00", CurrentDue: "100.00",
		},
		updateErrs: []error{errors.New("user service down")},
	}
	writer := &mockWriter{}
	svc := newTestService(users, &mockMerchantGateway{
		merchant: clients.MerchantDTO{ID: 2, CommissionPercentage: "5.00"},
	}, writer)

	err := svc.ProcessTransaction(context.Background(), "Bearer t", sqlc.CreateTransactionParams{
		UserID: 1, MerchantID: merchantID(2), Amount: "50.00",
	})
	if err == nil {
		t.Fatal("expected error")
	}
	if writer.called {
		t.Fatal("local transaction must not be created when due update fails")
	}
	if len(users.updateCalls) != 1 {
		t.Fatalf("expected 1 due update attempt, got %d", len(users.updateCalls))
	}
}

func TestProcessTransaction_LocalInsertFails_CompensatesDue(t *testing.T) {
	users := &mockUserGateway{
		user: clients.UserDTO{
			ID: 1, CreditLimit: "2000.00", CurrentDue: "100.00",
		},
	}
	writer := &mockWriter{err: errors.New("db insert failed")}
	svc := newTestService(users, &mockMerchantGateway{
		merchant: clients.MerchantDTO{ID: 2, CommissionPercentage: "5.00"},
	}, writer)

	err := svc.ProcessTransaction(context.Background(), "Bearer t", sqlc.CreateTransactionParams{
		UserID: 1, MerchantID: merchantID(2), Amount: "50.00",
	})
	if err == nil {
		t.Fatal("expected error from insert failure")
	}
	if !writer.called {
		t.Fatal("expected create attempt")
	}
	if len(users.updateCalls) != 2 {
		t.Fatalf("expected due update then rollback, got calls=%v", users.updateCalls)
	}
	if users.updateCalls[0] != "150.00" {
		t.Fatalf("expected new due 150.00, got %s", users.updateCalls[0])
	}
	if users.updateCalls[1] != "100.00" {
		t.Fatalf("expected rollback to 100.00, got %s", users.updateCalls[1])
	}
}

func TestProcessTransaction_LocalInsertFails_RollbackAlsoFails(t *testing.T) {
	users := &mockUserGateway{
		user: clients.UserDTO{
			ID: 1, CreditLimit: "2000.00", CurrentDue: "100.00",
		},
		updateErrs: []error{nil, errors.New("rollback failed")},
	}
	writer := &mockWriter{err: errors.New("db insert failed")}
	svc := newTestService(users, &mockMerchantGateway{
		merchant: clients.MerchantDTO{ID: 2, CommissionPercentage: "5.00"},
	}, writer)

	err := svc.ProcessTransaction(context.Background(), "Bearer t", sqlc.CreateTransactionParams{
		UserID: 1, MerchantID: merchantID(2), Amount: "50.00",
	})
	if err == nil {
		t.Fatal("expected error")
	}
	if len(users.updateCalls) != 2 {
		t.Fatalf("expected 2 due calls, got %v", users.updateCalls)
	}
}

func TestProcessTransaction_Success(t *testing.T) {
	users := &mockUserGateway{
		user: clients.UserDTO{
			ID: 1, CreditLimit: "2000.00", CurrentDue: "100.00",
		},
	}
	writer := &mockWriter{}
	svc := newTestService(users, &mockMerchantGateway{
		merchant: clients.MerchantDTO{ID: 2, CommissionPercentage: "5.00"},
	}, writer)

	err := svc.ProcessTransaction(context.Background(), "Bearer t", sqlc.CreateTransactionParams{
		UserID: 1, MerchantID: merchantID(2), Amount: "50.00",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !writer.called {
		t.Fatal("expected local create")
	}
	if len(users.updateCalls) != 1 || users.updateCalls[0] != "150.00" {
		t.Fatalf("unexpected due updates: %v", users.updateCalls)
	}
}

func TestProcessPayback_LocalInsertFails_CompensatesDue(t *testing.T) {
	users := &mockUserGateway{
		user: clients.UserDTO{
			ID: 1, CreditLimit: "2000.00", CurrentDue: "100.00",
		},
	}
	writer := &mockWriter{err: errors.New("db insert failed")}
	svc := newTestService(users, nil, writer)

	err := svc.ProcessPayback(context.Background(), "Bearer t", sqlc.CreateTransactionParams{
		UserID: 1, Amount: "40.00",
	})
	if err == nil {
		t.Fatal("expected error")
	}
	if len(users.updateCalls) != 2 {
		t.Fatalf("expected due update then rollback, got %v", users.updateCalls)
	}
	if users.updateCalls[0] != "60.00" {
		t.Fatalf("expected new due 60.00, got %s", users.updateCalls[0])
	}
	if users.updateCalls[1] != "100.00" {
		t.Fatalf("expected rollback to 100.00, got %s", users.updateCalls[1])
	}
}

func TestProcessPayback_UserUpdateFails_NoLocalWrite(t *testing.T) {
	users := &mockUserGateway{
		user: clients.UserDTO{
			ID: 1, CreditLimit: "2000.00", CurrentDue: "100.00",
		},
		updateErrs: []error{errors.New("user service down")},
	}
	writer := &mockWriter{}
	svc := newTestService(users, nil, writer)

	err := svc.ProcessPayback(context.Background(), "Bearer t", sqlc.CreateTransactionParams{
		UserID: 1, Amount: "40.00",
	})
	if err == nil {
		t.Fatal("expected error")
	}
	if writer.called {
		t.Fatal("local transaction must not be created when due update fails")
	}
}
