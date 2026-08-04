package services

import (
	"context"

	"Paylater/internal/database"
	"Paylater/internal/db/sqlc"

	"golang.org/x/crypto/bcrypt"
)

func CreateAdmin(admin sqlc.CreateAdminParams) error {

	// Hash Password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(admin.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	// Store hashed password
	admin.Password = string(hashedPassword)

	err = database.Queries.CreateAdmin(context.Background(), admin)
	if err != nil {
		return err
	}

	return nil
}

func GetAdmins() ([]sqlc.Admin, error) {

	admins, err := database.Queries.GetAllAdmins(context.Background())
	if err != nil {
		return nil, err
	}

	return admins, nil
}

func GetAdminByID(id int32) (sqlc.Admin, error) {

	admin, err := database.Queries.GetAdminByID(context.Background(), id)
	if err != nil {
		return sqlc.Admin{}, err
	}

	return admin, nil
}

func DeleteAdmin(id int32) error {

	err := database.Queries.DeleteAdmin(context.Background(), id)
	if err != nil {
		return err
	}

	return nil
}