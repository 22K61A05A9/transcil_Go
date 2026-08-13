package services
import (
	"context"
	"Paylater/internal/db/sqlc"
	"Paylater/internal/database"
	"golang.org/x/crypto/bcrypt"
)
func CreateUser(user sqlc.CreateUserParams) error {

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(user.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	// Replace plain password with hashed password
	user.Password = string(hashedPassword)

	// Always create normal users
	user.Role = sqlc.UsersRoleUSER

	err = database.Queries.CreateUser(context.Background(), user)
	if err != nil {
		return err
	}

	return nil
}

func GetUsers() ([]sqlc.User, error) {

	users, err := database.Queries.GetAllUsers(context.Background())

	if err != nil {
		return nil, err
	}

	return users, nil
}

func GetUserByID(id int32) (sqlc.User, error) {

	user, err := database.Queries.GetUserByID(context.Background(), id)

	if err != nil {
		return sqlc.User{}, err
	}

	return user, nil
}

func UpdateUser(user sqlc.UpdateUserParams) error {

	err := database.Queries.UpdateUser(context.Background(), user)

	if err != nil {
		return err
	}

	return nil
}

func DeleteUser(id int32) error {

	err := database.Queries.DeleteUser(context.Background(), id)

	if err != nil {
		return err
	}

	return nil
}

func UpdateCurrentDue(user sqlc.UpdateCurrentDueParams) error {

	err := database.Queries.UpdateCurrentDue(context.Background(), user)

	if err != nil {
		return err
	}

	return nil
}