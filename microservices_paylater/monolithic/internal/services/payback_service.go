package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"

	"Paylater/internal/database"
	"Paylater/internal/db/sqlc"
)

// Process Payback
func ProcessPayback(transaction sqlc.CreateTransactionParams) error {

	ctx := context.Background()

	// Set Transaction Type
	transaction.TransactionType = sqlc.TransactionsTransactionTypePAYBACK

	// Get User
	user, err := database.Queries.GetUserByID(ctx, transaction.UserID)
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

	newCurrentDue := currentDue - amount

	// Merchant is NULL for Payback
	transaction.MerchantID = sql.NullInt32{}

	transaction.Commission = "0.00"
	transaction.CommissionPercentage = "0.00"

	// Save Transaction
	err = database.Queries.CreateTransaction(ctx, transaction)
	if err != nil {
		return err
	}

	// Update Current Due
	err = database.Queries.UpdateCurrentDue(
		ctx,
		sqlc.UpdateCurrentDueParams{
			ID:         transaction.UserID,
			CurrentDue: fmt.Sprintf("%.2f", newCurrentDue),
		},
	)

	if err != nil {
		return err
	}

	return nil
}