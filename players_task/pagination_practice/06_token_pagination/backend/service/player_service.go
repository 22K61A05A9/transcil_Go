package services

import (
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"

	"players_task/db"
	repo "players_task/repository"
)

var (
	ErrInvalidLimit   = errors.New("limit must be a positive integer")
	ErrInvalidToken   = errors.New("invalid pagination token")
	ErrPlayerNotFound = errors.New("player not found")
)

type PlayerService struct {
	repository *repo.PlayerRepository
}

func NewPlayerService(
	repository *repo.PlayerRepository,
) *PlayerService {
	return &PlayerService{
		repository: repository,
	}
}

// ========================================================
// TOKEN PAYLOAD
// ========================================================

type tokenPayload struct {
	LastName     string `json:"lastName"`
	LastPlayerID string `json:"lastPlayerID"`
}

// ========================================================
// TOKEN PAGINATION RESULT
// ========================================================

type TokenPlayerListResult struct {
	Players     []db.Person
	Limit       int
	NextToken   string
	HasNextPage bool
}

// ========================================================
// ENCODE TOKEN
// ========================================================

func encodeToken(
	lastName string,
	lastPlayerID string,
) (string, error) {

	payload := tokenPayload{
		LastName:     lastName,
		LastPlayerID: lastPlayerID,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(data), nil
}

// ========================================================
// DECODE TOKEN
// ========================================================

func decodeToken(token string) (tokenPayload, error) {

	token = strings.TrimSpace(token)

	// First request has no token.
	if token == "" {
		return tokenPayload{}, nil
	}

	data, err := base64.RawURLEncoding.DecodeString(token)
	if err != nil {
		return tokenPayload{}, ErrInvalidToken
	}

	var payload tokenPayload

	if err := json.Unmarshal(data, &payload); err != nil {
		return tokenPayload{}, ErrInvalidToken
	}

	return payload, nil
}

// ========================================================
// TOKEN PAGINATION
// ========================================================
//
// First request:
//
// GET /players?limit=20
//
// Next request:
//
// GET /players?limit=20&token=<opaque-token>
//
// The token internally contains:
//
//     lastName
//     lastPlayerID
//
// The frontend only sees the encoded token.
//

func (s *PlayerService) GetPlayersByToken(
	ctx context.Context,
	token string,
	limit int,
) (*TokenPlayerListResult, error) {

	if limit < 1 {
		return nil, ErrInvalidLimit
	}

	// Maximum 100 records per request.
	if limit > 100 {
		limit = 100
	}

	// Decode token.
	payload, err := decodeToken(token)
	if err != nil {
		return nil, err
	}

	// Fetch one extra record to determine
	// whether another page exists.
	fetchLimit := int32(limit + 1)

	players, err := s.repository.GetPlayersByKeyset(
		ctx,
		payload.LastName,
		payload.LastPlayerID,
		fetchLimit,
	)

	if err != nil {
		return nil, err
	}

	hasNextPage := len(players) > limit

	// Remove the extra record.
	if hasNextPage {
		players = players[:limit]
	}

	// Create token for the next page.
	nextToken := ""

	if hasNextPage && len(players) > 0 {

		lastPlayer := players[len(players)-1]

		lastName := ""

		if lastPlayer.Namelast.Valid {
			lastName = lastPlayer.Namelast.String
		}

		nextToken, err = encodeToken(
			lastName,
			lastPlayer.Playerid,
		)

		if err != nil {
			return nil, err
		}
	}

	return &TokenPlayerListResult{
		Players:     players,
		Limit:       limit,
		NextToken:   nextToken,
		HasNextPage: hasNextPage,
	}, nil
}

// ========================================================
// GET PLAYER BY ID
// ========================================================

func (s *PlayerService) GetPlayerByID(
	ctx context.Context,
	playerID string,
) (db.Person, error) {

	player, err := s.repository.GetPlayerByID(
		ctx,
		playerID,
	)

	if err != nil {

		if errors.Is(err, sql.ErrNoRows) {
			return db.Person{}, ErrPlayerNotFound
		}

		return db.Person{}, err
	}

	return player, nil
}
