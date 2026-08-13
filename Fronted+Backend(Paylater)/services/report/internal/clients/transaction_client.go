package clients

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"Paylater/services/report/internal/config"
)

// TransactionDTO is the subset needed for merchant fee aggregation.
type TransactionDTO struct {
	Commission string `json:"commission"`
}

type TransactionClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewTransactionClient(cfg config.Config) *TransactionClient {
	return &TransactionClient{
		baseURL: cfg.TransactionServiceURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *TransactionClient) GetTransactionsByMerchant(ctx context.Context, authHeader string, merchantID int32) ([]TransactionDTO, error) {
	url := fmt.Sprintf("%s/transactions/merchant/%d", c.baseURL, merchantID)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, unreachableError("transaction", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, mapUpstreamError("transaction", resp.StatusCode, body)
	}

	var transactions []TransactionDTO
	if err := json.Unmarshal(body, &transactions); err != nil {
		return nil, err
	}
	if transactions == nil {
		transactions = []TransactionDTO{}
	}
	return transactions, nil
}
