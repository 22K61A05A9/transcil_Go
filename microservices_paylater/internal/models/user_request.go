package models

type CreateUserRequest struct {
	UserName string `json:"user_name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}
type UpdateUserRequest struct {
	UserName string `json:"user_name" binding:"required"`
}