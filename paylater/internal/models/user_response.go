package models

type UserResponse struct {
	ID          int32  `json:"id"`
	UserName    string `json:"user_name"`
	CreditLimit string `json:"credit_limit"`
	CurrentDue  string `json:"current_due"`
}