package services

import (
	"context"
	"errors"
	"strconv"

	"Paylater/services/merchant/internal/db/sqlc"

	"golang.org/x/crypto/bcrypt"
)

// Service holds database dependencies for the merchant domain.
type Service struct {
	queries *sqlc.Queries
}

// New creates a merchant Service with an injected sqlc Queries instance.
func New(queries *sqlc.Queries) *Service {
	return &Service{queries: queries}
}

func (s *Service) CreateMerchant(ctx context.Context, merchant sqlc.CreateMerchantParams) error {

	// Validate Commission Percentage (Allowed only between 3% and 10%)
	commission, err := strconv.ParseFloat(merchant.CommissionPercentage, 64)
	if err != nil {
		return errors.New("invalid commission percentage")
	}

	if commission < 3 || commission > 10 {
		return errors.New("commission percentage must be between 3 and 10")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(merchant.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	merchant.Password = string(hashedPassword)

	return s.queries.CreateMerchant(ctx, merchant)
}

func (s *Service) GetMerchants(ctx context.Context) ([]sqlc.Merchant, error) {
	return s.queries.GetAllMerchants(ctx)
}

func (s *Service) GetMerchantByID(ctx context.Context, id int32) (sqlc.Merchant, error) {
	return s.queries.GetMerchantByID(ctx, id)
}

func (s *Service) UpdateMerchant(ctx context.Context, merchant sqlc.UpdateMerchantParams) error {
	return s.queries.UpdateMerchant(ctx, merchant)
}

func (s *Service) UpdateCommission(ctx context.Context, merchant sqlc.UpdateCommissionParams) error {
	return s.queries.UpdateCommission(ctx, merchant)
}

func (s *Service) DeleteMerchant(ctx context.Context, id int32) error {
	return s.queries.DeleteMerchant(ctx, id)
}
