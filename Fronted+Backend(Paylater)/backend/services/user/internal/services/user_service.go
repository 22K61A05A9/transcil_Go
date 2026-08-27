package services

import (
	"context"

	"Paylater/services/user/internal/db/sqlc"

	"golang.org/x/crypto/bcrypt"
)

// Service holds database dependencies for the user domain.
type Service struct {
	queries *sqlc.Queries
}

// New creates a user Service with an injected sqlc Queries instance.
func New(queries *sqlc.Queries) *Service {
	return &Service{queries: queries}
}

func (s *Service) CreateUser(ctx context.Context, user sqlc.CreateUserParams) error {

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(user.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)

	return s.queries.CreateUser(ctx, user)
}

func (s *Service) GetUsers(ctx context.Context) ([]sqlc.User, error) {
	return s.queries.GetAllUsers(ctx)
}

func (s *Service) GetUserByID(ctx context.Context, id int32) (sqlc.User, error) {
	return s.queries.GetUserByID(ctx, id)
}

func (s *Service) UpdateUser(ctx context.Context, user sqlc.UpdateUserParams) error {
	return s.queries.UpdateUser(ctx, user)
}

func (s *Service) DeleteUser(ctx context.Context, id int32) error {
	return s.queries.DeleteUser(ctx, id)
}

func (s *Service) UpdateCurrentDue(ctx context.Context, params sqlc.UpdateCurrentDueParams) error {
	return s.queries.UpdateCurrentDue(ctx, params)
}
