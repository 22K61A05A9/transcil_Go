package clients

import "Paylater/services/report/internal/config"

// Package-level clients used by report services (same pattern as Transaction S2S).
var (
	User        *UserClient
	Transaction *TransactionClient
)

// Init constructs HTTP clients from config. Call once at process startup.
func Init(cfg config.Config) {
	User = NewUserClient(cfg)
	Transaction = NewTransactionClient(cfg)
}
