package services

import (
	"context"

	"Paylater/services/user/internal/database"
	"Paylater/services/user/internal/db/sqlc"

	"golang.org/x/crypto/bcrypt"
)

func CreateUser(ctx context.Context, user sqlc.CreateUserParams) error {

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(user.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)

	return database.Queries.CreateUser(ctx, user)
}

func GetUsers(ctx context.Context) ([]sqlc.User, error) {
	return database.Queries.GetAllUsers(ctx)
}

func GetUserByID(ctx context.Context, id int32) (sqlc.User, error) {
	return database.Queries.GetUserByID(ctx, id)
}

func UpdateUser(ctx context.Context, user sqlc.UpdateUserParams) error {
	return database.Queries.UpdateUser(ctx, user)
}

func DeleteUser(ctx context.Context, id int32) error {
	return database.Queries.DeleteUser(ctx, id)
}

func UpdateCurrentDue(ctx context.Context, params sqlc.UpdateCurrentDueParams) error {
	return database.Queries.UpdateCurrentDue(ctx, params)
}
