package clients

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"Paylater/services/transaction/internal/config"
)

// UserDTO is the subset of User Service GET /users/:id used by purchase/payback.
type UserDTO struct {
	ID          int32  `json:"id"`
	UserName    string `json:"user_name"`
	CreditLimit string `json:"credit_limit"`
	CurrentDue  string `json:"current_due"`
}

type UserClient struct {
	baseURL       string
	internalToken string
	httpClient    *http.Client
}

func NewUserClient(cfg config.Config) *UserClient {
	return &UserClient{
		baseURL:       cfg.UserServiceURL,
		internalToken: cfg.InternalServiceToken,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *UserClient) GetUserByID(ctx context.Context, authHeader string, id int32) (UserDTO, error) {
	url := fmt.Sprintf("%s/users/%d", c.baseURL, id)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return UserDTO{}, err
	}
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return UserDTO{}, unreachableError("user", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return UserDTO{}, err
	}

	if resp.StatusCode != http.StatusOK {
		return UserDTO{}, mapUpstreamError("user", resp.StatusCode, body)
	}

	var user UserDTO
	if err := json.Unmarshal(body, &user); err != nil {
		return UserDTO{}, err
	}
	return user, nil
}

func (c *UserClient) UpdateCurrentDue(ctx context.Context, authHeader string, id int32, currentDue string) error {
	url := fmt.Sprintf("%s/users/%d/current-due", c.baseURL, id)

	payload, err := json.Marshal(map[string]string{"current_due": currentDue})
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}
	if c.internalToken != "" {
		req.Header.Set("X-Internal-Token", c.internalToken)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return unreachableError("user", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if resp.StatusCode != http.StatusOK {
		return mapUpstreamError("user", resp.StatusCode, body)
	}
	return nil
}
