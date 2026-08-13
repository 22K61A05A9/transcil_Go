package models

type MerchantResponse struct {
	ID                   int32  `json:"id"`
	MerchantName         string `json:"merchant_name"`
	Email                string `json:"email"`
	PhoneNumber          string `json:"phone_number"`
	CommissionPercentage string `json:"commission_percentage"`
}