package services

import (
	"context"

	"Paylater/services/admin/internal/db/sqlc"

	"golang.org/x/crypto/bcrypt"
)

// Service holds database dependencies for the admin domain.
type Service struct {
	queries *sqlc.Queries
}

// New creates an admin Service with an injected sqlc Queries instance.
func New(queries *sqlc.Queries) *Service {
	return &Service{queries: queries}
}

func (s *Service) CreateAdmin(ctx context.Context, admin sqlc.CreateAdminParams) error {

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(admin.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	admin.Password = string(hashedPassword)

	return s.queries.CreateAdmin(ctx, admin)
}

func (s *Service) GetAdmins(ctx context.Context) ([]sqlc.Admin, error) {
	return s.queries.GetAllAdmins(ctx)
}

func (s *Service) GetAdminByID(ctx context.Context, id int32) (sqlc.Admin, error) {
	return s.queries.GetAdminByID(ctx, id)
}

func (s *Service) DeleteAdmin(ctx context.Context, id int32) error {
	return s.queries.DeleteAdmin(ctx, id)
}
