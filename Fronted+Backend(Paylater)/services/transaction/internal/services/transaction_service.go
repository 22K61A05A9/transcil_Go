package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strconv"

	"Paylater/services/transaction/internal/clients"
	"Paylater/services/transaction/internal/db/sqlc"
)

// transactionWriter persists transactions (satisfied by *sqlc.Queries).
type transactionWriter interface {
	CreateTransaction(ctx context.Context, arg sqlc.CreateTransactionParams) error
}

// userGateway is the User Service subset used by purchase/payback.
type userGateway interface {
	GetUserByID(ctx context.Context, authHeader string, id int32) (clients.UserDTO, error)
	UpdateCurrentDue(ctx context.Context, authHeader string, id int32, currentDue string) error
}

// merchantGateway is the Merchant Service subset used by purchase.
type merchantGateway interface {
	GetMerchantByID(ctx context.Context, authHeader string, id int32) (clients.MerchantDTO, error)
}

// Service holds database and upstream dependencies for the transaction domain.
type Service struct {
	queries   *sqlc.Queries
	writer    transactionWriter
	users     userGateway
	merchants merchantGateway
}

// New creates a transaction Service wired to sqlc Queries and package HTTP clients.
func New(queries *sqlc.Queries) *Service {
	return &Service{
		queries:   queries,
		writer:    queries,
		users:     clients.User,
		merchants: clients.Merchant,
	}
}

func (s *Service) ProcessTransaction(ctx context.Context, authHeader string, transaction sqlc.CreateTransactionParams) error {

	transaction.TransactionType = sqlc.TransactionsTransactionTypePURCHASE

	user, err := s.users.GetUserByID(ctx, authHeader, transaction.UserID)
	if err != nil {
		return err
	}

	merchant, err := s.merchants.GetMerchantByID(ctx, authHeader, transaction.MerchantID.Int32)
	if err != nil {
		return err
	}

	creditLimit, err := strconv.ParseFloat(user.CreditLimit, 64)
	if err != nil {
		return err
	}

	currentDue, err := strconv.ParseFloat(user.CurrentDue, 64)
	if err != nil {
		return err
	}

	amount, err := strconv.ParseFloat(transaction.Amount, 64)
	if err != nil {
		return err
	}

	commissionPercentage, err := strconv.ParseFloat(merchant.CommissionPercentage, 64)
	if err != nil {
		return err
	}

	availableCredit := creditLimit - currentDue

	if amount > availableCredit {
		return errors.New("credit limit exceeded")
	}

	commission := (amount * commissionPercentage) / 100

	transaction.Commission = fmt.Sprintf("%.2f", commission)
	transaction.CommissionPercentage = merchant.CommissionPercentage

	originalDue := user.CurrentDue
	newCurrentDue := fmt.Sprintf("%.2f", currentDue+amount)

	// User due first, then local transaction. If local insert fails, roll due back.
	if err := s.users.UpdateCurrentDue(ctx, authHeader, transaction.UserID, newCurrentDue); err != nil {
		return err
	}

	if err := s.writer.CreateTransaction(ctx, transaction); err != nil {
		if compErr := s.users.UpdateCurrentDue(ctx, authHeader, transaction.UserID, originalDue); compErr != nil {
			log.Printf(
				"MANUAL RECONCILIATION REQUIRED: purchase due updated but transaction insert failed and due rollback failed; user_id=%d amount=%s original_due=%s updated_due=%s insert_err=%v rollback_err=%v",
				transaction.UserID,
				transaction.Amount,
				originalDue,
				newCurrentDue,
				err,
				compErr,
			)
			return fmt.Errorf("transaction persist failed after due update; due rollback also failed: %w", err)
		}
		log.Printf(
			"compensated purchase: rolled back user current_due after transaction insert failure; user_id=%d amount=%s restored_due=%s insert_err=%v",
			transaction.UserID,
			transaction.Amount,
			originalDue,
			err,
		)
		return err
	}

	return nil
}

func (s *Service) GetTransactions(ctx context.Context) ([]sqlc.Transaction, error) {
	return s.queries.GetAllTransactions(ctx)
}

func (s *Service) GetTransactionByID(ctx context.Context, id int32) (sqlc.Transaction, error) {
	return s.queries.GetTransactionByID(ctx, id)
}

func (s *Service) GetTransactionsByUser(ctx context.Context, id int32) ([]sqlc.Transaction, error) {
	return s.queries.GetTransactionsByUser(ctx, id)
}

func (s *Service) GetTransactionsByMerchant(ctx context.Context, id sql.NullInt32) ([]sqlc.Transaction, error) {
	return s.queries.GetTransactionsByMerchant(ctx, id)
}
