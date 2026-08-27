package models

type MerchantResponse struct {
	ID                   int32  `json:"id"`
	MerchantName         string `json:"merchant_name"`
	Email                string `json:"email"`
	PhoneNumber          string `json:"phone_number"`
	CommissionPercentage string `json:"commission_percentage"`
}

// AvailableMerchantResponse is the public catalog projection for purchase UI.
// Intentionally omits email, phone, commission, and credentials.
type AvailableMerchantResponse struct {
	ID           int32  `json:"id"`
	MerchantName string `json:"merchant_name"`
}
