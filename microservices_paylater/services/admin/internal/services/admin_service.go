package services

import (
	"context"

	"Paylater/services/admin/internal/database"
	"Paylater/services/admin/internal/db/sqlc"

	"golang.org/x/crypto/bcrypt"
)

func CreateAdmin(ctx context.Context, admin sqlc.CreateAdminParams) error {

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(admin.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	admin.Password = string(hashedPassword)

	return database.Queries.CreateAdmin(ctx, admin)
}

func GetAdmins(ctx context.Context) ([]sqlc.Admin, error) {
	return database.Queries.GetAllAdmins(ctx)
}

func GetAdminByID(ctx context.Context, id int32) (sqlc.Admin, error) {
	return database.Queries.GetAdminByID(ctx, id)
}

func DeleteAdmin(ctx context.Context, id int32) error {
	return database.Queries.DeleteAdmin(ctx, id)
}
