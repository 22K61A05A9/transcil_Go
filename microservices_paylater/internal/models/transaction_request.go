package models

type CreateTransactionRequest struct {
	MerchantID int32  `json:"merchant_id" binding:"required"`
	Amount     string `json:"amount" binding:"required"`
}