package config

import "os"

// Config holds upstream microservice base URLs.
type Config struct {
	UserServiceURL         string
	TransactionServiceURL  string
	AdminServiceURL        string
	MerchantServiceURL     string
	ReportServiceURL       string
}

// Load reads upstream URLs from the environment with localhost defaults.
func Load() Config {
	return Config{
		UserServiceURL:        envOrDefault("USER_SERVICE_URL", "http://localhost:9091"),
		TransactionServiceURL: envOrDefault("TRANSACTION_SERVICE_URL", "http://localhost:9092"),
		AdminServiceURL:       envOrDefault("ADMIN_SERVICE_URL", "http://localhost:9093"),
		MerchantServiceURL:    envOrDefault("MERCHANT_SERVICE_URL", "http://localhost:9094"),
		ReportServiceURL:      envOrDefault("REPORT_SERVICE_URL", "http://localhost:9095"),
	}
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
