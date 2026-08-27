package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strconv"

	"Paylater/services/transaction/internal/db/sqlc"
)

func (s *Service) ProcessPayback(ctx context.Context, authHeader string, transaction sqlc.CreateTransactionParams) error {

	transaction.TransactionType = sqlc.TransactionsTransactionTypePAYBACK

	user, err := s.users.GetUserByID(ctx, authHeader, transaction.UserID)
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

	if amount > currentDue {
		return errors.New("payment exceeds current due")
	}

	originalDue := user.CurrentDue
	newCurrentDue := fmt.Sprintf("%.2f", currentDue-amount)

	transaction.MerchantID = sql.NullInt32{}

	transaction.Commission = "0.00"
	transaction.CommissionPercentage = "0.00"

	// User due first, then local transaction. If local insert fails, roll due back.
	if err := s.users.UpdateCurrentDue(ctx, authHeader, transaction.UserID, newCurrentDue); err != nil {
		return err
	}

	if err := s.writer.CreateTransaction(ctx, transaction); err != nil {
		if compErr := s.users.UpdateCurrentDue(ctx, authHeader, transaction.UserID, originalDue); compErr != nil {
			log.Printf(
				"MANUAL RECONCILIATION REQUIRED: payback due updated but transaction insert failed and due rollback failed; user_id=%d amount=%s original_due=%s updated_due=%s insert_err=%v rollback_err=%v",
				transaction.UserID,
				transaction.Amount,
				originalDue,
				newCurrentDue,
				err,
				compErr,
			)
			return fmt.Errorf("payback persist failed after due update; due rollback also failed: %w", err)
		}
		log.Printf(
			"compensated payback: rolled back user current_due after transaction insert failure; user_id=%d amount=%s restored_due=%s insert_err=%v",
			transaction.UserID,
			transaction.Amount,
			originalDue,
			err,
		)
		return err
	}

	return nil
}
