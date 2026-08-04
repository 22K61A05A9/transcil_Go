package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strconv"

	"Paylater/services/transaction/internal/clients"
	"Paylater/services/transaction/internal/database"
	"Paylater/services/transaction/internal/db/sqlc"
)

func ProcessPayback(ctx context.Context, authHeader string, transaction sqlc.CreateTransactionParams) error {

	transaction.TransactionType = sqlc.TransactionsTransactionTypePAYBACK

	user, err := clients.User.GetUserByID(ctx, authHeader, transaction.UserID)
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

	newCurrentDue := fmt.Sprintf("%.2f", currentDue-amount)

	transaction.MerchantID = sql.NullInt32{}

	transaction.Commission = "0.00"
	transaction.CommissionPercentage = "0.00"

	// Local DB write first, then User Service due update.
	if err := database.Queries.CreateTransaction(ctx, transaction); err != nil {
		return err
	}

	if err := clients.User.UpdateCurrentDue(ctx, authHeader, transaction.UserID, newCurrentDue); err != nil {
		log.Printf(
			"MANUAL RECONCILIATION REQUIRED: payback transaction persisted but user current_due update failed; user_id=%d amount=%s expected_current_due=%s err=%v",
			transaction.UserID,
			transaction.Amount,
			newCurrentDue,
			err,
		)
		return err
	}

	return nil
}
