package models

type CreatePaybackRequest struct {
	Amount string `json:"amount" binding:"required"`
}
