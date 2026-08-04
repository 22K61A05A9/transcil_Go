package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"

	"Paylater/services/transaction/internal/database"
	"Paylater/services/transaction/internal/db/sqlc"
)

func ProcessPayback(transaction sqlc.CreateTransactionParams) error {

	ctx := context.Background()

	transaction.TransactionType = sqlc.TransactionsTransactionTypePAYBACK

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

	transaction.MerchantID = sql.NullInt32{}

	transaction.Commission = "0.00"
	transaction.CommissionPercentage = "0.00"

	err = database.Queries.CreateTransaction(ctx, transaction)
	if err != nil {
		return err
	}

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
