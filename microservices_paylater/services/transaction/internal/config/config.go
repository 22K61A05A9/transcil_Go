package config

import "os"

// Config holds upstream service base URLs and the shared S2S token.
type Config struct {
	UserServiceURL        string
	MerchantServiceURL    string
	InternalServiceToken  string
}

// Load reads S2S settings from the environment with localhost defaults.
func Load() Config {
	return Config{
		UserServiceURL:       envOrDefault("USER_SERVICE_URL", "http://localhost:9091"),
		MerchantServiceURL:   envOrDefault("MERCHANT_SERVICE_URL", "http://localhost:9094"),
		InternalServiceToken: os.Getenv("INTERNAL_SERVICE_TOKEN"),
	}
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
