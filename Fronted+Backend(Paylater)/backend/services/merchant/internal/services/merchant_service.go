package services

import (
	"context"
	"errors"
	"strconv"

	"Paylater/services/merchant/internal/db/sqlc"

	"github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

var (
	// ErrInvalidCommissionPercentage is returned when commission is not a number.
	ErrInvalidCommissionPercentage = errors.New("invalid commission percentage")
	// ErrCommissionOutOfRange is returned when commission is outside [3, 10].
	ErrCommissionOutOfRange = errors.New("commission percentage must be between 3 and 10")
	// ErrDuplicateEmail is returned when the merchant email already exists.
	ErrDuplicateEmail = errors.New("email already registered")
)

// MerchantStore is the persistence surface used by the merchant Service.
// *sqlc.Queries implements this interface.
type MerchantStore interface {
	CreateMerchant(ctx context.Context, arg sqlc.CreateMerchantParams) error
	GetMerchantByEmail(ctx context.Context, email string) (sqlc.Merchant, error)
	GetAllMerchants(ctx context.Context) ([]sqlc.Merchant, error)
	GetAvailableMerchants(ctx context.Context) ([]sqlc.GetAvailableMerchantsRow, error)
	GetMerchantByID(ctx context.Context, id int32) (sqlc.Merchant, error)
	UpdateMerchant(ctx context.Context, arg sqlc.UpdateMerchantParams) error
	UpdateCommission(ctx context.Context, arg sqlc.UpdateCommissionParams) error
	DeleteMerchant(ctx context.Context, id int32) error
}

// Service holds database dependencies for the merchant domain.
type Service struct {
	queries MerchantStore
}

// New creates a merchant Service with an injected store (typically *sqlc.Queries).
func New(queries MerchantStore) *Service {
	return &Service{queries: queries}
}

func validateCommissionPercentage(value string) error {
	commission, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return ErrInvalidCommissionPercentage
	}
	if commission < 3 || commission > 10 {
		return ErrCommissionOutOfRange
	}
	return nil
}

func isDuplicateEmailError(err error) bool {
	var mysqlErr *mysql.MySQLError
	if errors.As(err, &mysqlErr) {
		return mysqlErr.Number == 1062
	}
	return false
}

func (s *Service) CreateMerchant(ctx context.Context, merchant sqlc.CreateMerchantParams) error {
	if err := validateCommissionPercentage(merchant.CommissionPercentage); err != nil {
		return err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(merchant.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	merchant.Password = string(hashedPassword)

	if err := s.queries.CreateMerchant(ctx, merchant); err != nil {
		if isDuplicateEmailError(err) {
			return ErrDuplicateEmail
		}
		return err
	}
	return nil
}

func (s *Service) GetMerchants(ctx context.Context) ([]sqlc.Merchant, error) {
	return s.queries.GetAllMerchants(ctx)
}

func (s *Service) GetAvailableMerchants(ctx context.Context) ([]sqlc.GetAvailableMerchantsRow, error) {
	return s.queries.GetAvailableMerchants(ctx)
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
