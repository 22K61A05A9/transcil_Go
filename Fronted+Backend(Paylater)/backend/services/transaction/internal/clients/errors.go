package clients

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

// ErrUpstreamUnavailable indicates the dependency could not be reached or
// returned a gateway-class failure. Handlers should map this to HTTP 502.
var ErrUpstreamUnavailable = errors.New("upstream service unavailable")

func mapUpstreamError(service string, statusCode int, body []byte) error {
	msg := extractErrorMessage(body)

	switch statusCode {
	case http.StatusBadGateway, http.StatusServiceUnavailable, http.StatusGatewayTimeout:
		if msg != "" {
			return fmt.Errorf("%w: %s", ErrUpstreamUnavailable, msg)
		}
		return fmt.Errorf("%w: %s service returned status %d", ErrUpstreamUnavailable, service, statusCode)
	case http.StatusNotFound:
		if msg != "" {
			return fmt.Errorf("%s", msg)
		}
		return fmt.Errorf("%s not found", service)
	case http.StatusUnauthorized, http.StatusForbidden:
		if msg != "" {
			return fmt.Errorf("%s", msg)
		}
		return fmt.Errorf("%s service authorization failed", service)
	default:
		if msg != "" {
			return fmt.Errorf("%s", msg)
		}
		return fmt.Errorf("%s service returned status %d", service, statusCode)
	}
}

func extractErrorMessage(body []byte) string {
	var payload struct {
		Error string `json:"error"`
	}
	if err := json.Unmarshal(body, &payload); err == nil && payload.Error != "" {
		return payload.Error
	}
	return ""
}

func unreachableError(service string, err error) error {
	return fmt.Errorf("%w: %s service unreachable: %v", ErrUpstreamUnavailable, service, err)
}
