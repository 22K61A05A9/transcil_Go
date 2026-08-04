package services

import (
	"context"
	"fmt"
	"sort"
	"strconv"

	"Paylater/services/report/internal/clients"
	"Paylater/services/report/internal/models"
)

func GetMerchantFeeCollected(ctx context.Context, authHeader string, merchantID int32) (string, error) {
	transactions, err := clients.Transaction.GetTransactionsByMerchant(ctx, authHeader, merchantID)
	if err != nil {
		return "", err
	}

	var total float64
	for _, tx := range transactions {
		if tx.Commission == "" {
			continue
		}
		commission, err := strconv.ParseFloat(tx.Commission, 64)
		if err != nil {
			return "", err
		}
		total += commission
	}

	return fmt.Sprintf("%.2f", total), nil
}

func GetUserDue(ctx context.Context, authHeader string, userID int32) (string, error) {
	user, err := clients.User.GetUserByID(ctx, authHeader, userID)
	if err != nil {
		return "", err
	}
	return user.CurrentDue, nil
}

func GetUsersReachedCreditLimit(ctx context.Context, authHeader string) ([]models.UserResponse, error) {
	users, err := clients.User.GetUsers(ctx, authHeader)
	if err != nil {
		return nil, err
	}

	var response []models.UserResponse
	for _, user := range users {
		due, err := strconv.ParseFloat(user.CurrentDue, 64)
		if err != nil {
			return nil, err
		}
		limit, err := strconv.ParseFloat(user.CreditLimit, 64)
		if err != nil {
			return nil, err
		}
		if due >= limit {
			response = append(response, models.UserResponse{
				ID:          user.ID,
				UserName:    user.UserName,
				CreditLimit: user.CreditLimit,
				CurrentDue:  user.CurrentDue,
			})
		}
	}
	return response, nil
}

func GetTotalUserDue(ctx context.Context, authHeader string) (string, error) {
	users, err := clients.User.GetUsers(ctx, authHeader)
	if err != nil {
		return "", err
	}

	var total float64
	for _, user := range users {
		due, err := strconv.ParseFloat(user.CurrentDue, 64)
		if err != nil {
			return "", err
		}
		total += due
	}

	return fmt.Sprintf("%.2f", total), nil
}

func GetCustomersWithDue(ctx context.Context, authHeader string) ([]models.UserResponse, error) {
	users, err := clients.User.GetUsers(ctx, authHeader)
	if err != nil {
		return nil, err
	}

	var response []models.UserResponse
	for _, user := range users {
		due, err := strconv.ParseFloat(user.CurrentDue, 64)
		if err != nil {
			return nil, err
		}
		if due > 0 {
			response = append(response, models.UserResponse{
				ID:          user.ID,
				UserName:    user.UserName,
				CreditLimit: user.CreditLimit,
				CurrentDue:  user.CurrentDue,
			})
		}
	}

	sort.Slice(response, func(i, j int) bool {
		dueI, _ := strconv.ParseFloat(response[i].CurrentDue, 64)
		dueJ, _ := strconv.ParseFloat(response[j].CurrentDue, 64)
		return dueI > dueJ
	})

	return response, nil
}
