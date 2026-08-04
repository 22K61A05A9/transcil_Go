package clients

import "Paylater/services/transaction/internal/config"

// Package-level clients used by transaction/payback services (same pattern as database.Queries).
var (
	User     *UserClient
	Merchant *MerchantClient
)

// Init constructs HTTP clients from config. Call once at process startup.
func Init(cfg config.Config) {
	User = NewUserClient(cfg)
	Merchant = NewMerchantClient(cfg)
}
