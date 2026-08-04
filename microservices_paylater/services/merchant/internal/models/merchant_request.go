package models

type CreateMerchantRequest struct {
	MerchantName         string `json:"merchant_name" binding:"required"`
	Email                string `json:"email" binding:"required,email"`
	Password             string `json:"password" binding:"required"`
	PhoneNumber          string `json:"phone_number"`
	CommissionPercentage string `json:"commission_percentage" binding:"required"`
}

type UpdateMerchantRequest struct {
	MerchantName string `json:"merchant_name" binding:"required"`
	PhoneNumber  string `json:"phone_number"`
}
