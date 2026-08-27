package clients

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"Paylater/services/transaction/internal/config"
)

// MerchantDTO is the subset of Merchant Service response used for commission.
type MerchantDTO struct {
	ID                   int32  `json:"id"`
	MerchantName         string `json:"merchant_name"`
	Email                string `json:"email"`
	PhoneNumber          string `json:"phone_number"`
	CommissionPercentage string `json:"commission_percentage"`
}

type MerchantClient struct {
	baseURL       string
	internalToken string
	httpClient    *http.Client
}

func NewMerchantClient(cfg config.Config) *MerchantClient {
	return &MerchantClient{
		baseURL:       cfg.MerchantServiceURL,
		internalToken: cfg.InternalServiceToken,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *MerchantClient) GetMerchantByID(ctx context.Context, authHeader string, id int32) (MerchantDTO, error) {
	url := fmt.Sprintf("%s/internal/merchants/%d", c.baseURL, id)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return MerchantDTO{}, err
	}
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}
	if c.internalToken != "" {
		req.Header.Set("X-Internal-Token", c.internalToken)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return MerchantDTO{}, unreachableError("merchant", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return MerchantDTO{}, err
	}

	if resp.StatusCode != http.StatusOK {
		return MerchantDTO{}, mapUpstreamError("merchant", resp.StatusCode, body)
	}

	var merchant MerchantDTO
	if err := json.Unmarshal(body, &merchant); err != nil {
		return MerchantDTO{}, err
	}
	return merchant, nil
}
