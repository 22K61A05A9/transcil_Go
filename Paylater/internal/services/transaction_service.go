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

// Process Transaction (Purchase)
func ProcessTransaction(transaction sqlc.CreateTransactionParams) error {

	ctx := context.Background()

	// Set Transaction Type
	transaction.TransactionType = sqlc.TransactionsTransactionTypePURCHASE

	// Get User
	user, err := database.Queries.GetUserByID(ctx, transaction.UserID)
	if err != nil {
		return err
	}

	// Get Merchant
	merchant, err := database.Queries.GetMerchantByID(ctx, transaction.MerchantID.Int32)
	if err != nil {
		return err
	}

	// Convert Values
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

	// Available Credit
	availableCredit := creditLimit - currentDue

	if amount > availableCredit {
		return errors.New("credit limit exceeded")
	}

	// Calculate Commission
	commission := (amount * commissionPercentage) / 100

	transaction.Commission = fmt.Sprintf("%.2f", commission)
	transaction.CommissionPercentage = merchant.CommissionPercentage

	// Update Current Due
	newCurrentDue := currentDue + amount

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

	// Save Transaction
	return database.Queries.CreateTransaction(ctx, transaction)
}

// Get All Transactions
func GetTransactions() ([]sqlc.Transaction, error) {

	transactions, err := database.Queries.GetAllTransactions(context.Background())
	if err != nil {
		return nil, err
	}

	return transactions, nil
}

// Get Transaction By ID
func GetTransactionByID(id int32) (sqlc.Transaction, error) {

	transaction, err := database.Queries.GetTransactionByID(context.Background(), id)
	if err != nil {
		return sqlc.Transaction{}, err
	}

	return transaction, nil
}

// Get Transactions By User
func GetTransactionsByUser(id int32) ([]sqlc.Transaction, error) {

	transactions, err := database.Queries.GetTransactionsByUser(context.Background(), id)
	if err != nil {
		return nil, err
	}

	return transactions, nil
}

// Get Transactions By Merchant
func GetTransactionsByMerchant(id sql.NullInt32) ([]sqlc.Transaction, error) {

	transactions, err := database.Queries.GetTransactionsByMerchant(context.Background(), id)
	if err != nil {
		return nil, err
	}

	return transactions, nil
}