package clients

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"fmt"
	"time"

	"Paylater/services/report/internal/config"
)

// UserDTO matches User Service list/detail JSON used by reports.
type UserDTO struct {
	ID          int32  `json:"id"`
	UserName    string `json:"user_name"`
	CreditLimit string `json:"credit_limit"`
	CurrentDue  string `json:"current_due"`
}

type UserClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewUserClient(cfg config.Config) *UserClient {
	return &UserClient{
		baseURL: cfg.UserServiceURL,
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

func (c *UserClient) GetUsers(ctx context.Context, authHeader string) ([]UserDTO, error) {
	url := fmt.Sprintf("%s/users", c.baseURL)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, unreachableError("user", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, mapUpstreamError("user", resp.StatusCode, body)
	}

	var users []UserDTO
	if err := json.Unmarshal(body, &users); err != nil {
		return nil, err
	}
	if users == nil {
		users = []UserDTO{}
	}
	return users, nil
}
