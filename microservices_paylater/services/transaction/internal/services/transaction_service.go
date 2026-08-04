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

func ProcessTransaction(ctx context.Context, authHeader string, transaction sqlc.CreateTransactionParams) error {

	transaction.TransactionType = sqlc.TransactionsTransactionTypePURCHASE

	user, err := clients.User.GetUserByID(ctx, authHeader, transaction.UserID)
	if err != nil {
		return err
	}

	merchant, err := clients.Merchant.GetMerchantByID(ctx, authHeader, transaction.MerchantID.Int32)
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

	newCurrentDue := fmt.Sprintf("%.2f", currentDue+amount)

	// Local DB write first, then User Service due update (same order as payback).
	if err := database.Queries.CreateTransaction(ctx, transaction); err != nil {
		return err
	}

	if err := clients.User.UpdateCurrentDue(ctx, authHeader, transaction.UserID, newCurrentDue); err != nil {
		log.Printf(
			"MANUAL RECONCILIATION REQUIRED: purchase transaction persisted but user current_due update failed; user_id=%d amount=%s expected_current_due=%s err=%v",
			transaction.UserID,
			transaction.Amount,
			newCurrentDue,
			err,
		)
		return err
	}

	return nil
}

func GetTransactions(ctx context.Context) ([]sqlc.Transaction, error) {
	return database.Queries.GetAllTransactions(ctx)
}

func GetTransactionByID(ctx context.Context, id int32) (sqlc.Transaction, error) {
	return database.Queries.GetTransactionByID(ctx, id)
}

func GetTransactionsByUser(ctx context.Context, id int32) ([]sqlc.Transaction, error) {
	return database.Queries.GetTransactionsByUser(ctx, id)
}

func GetTransactionsByMerchant(ctx context.Context, id sql.NullInt32) ([]sqlc.Transaction, error) {
	return database.Queries.GetTransactionsByMerchant(ctx, id)
}
