package services

import (
	"context"
	"database/sql"
	"errors"
	"math"
	"strings"

	"players_task/db"
	"players_task/repository"
)

var (
	ErrInvalidPage = errors.New(
		"page must be a positive integer",
	)

	ErrInvalidLimit = errors.New(
		"limit must be a positive integer",
	)

	ErrInvalidSortBy = errors.New(
		"sortBy must be firstName, birthYear, or height",
	)

	ErrInvalidSortOrder = errors.New(
		"sortOrder must be asc or desc",
	)

	ErrInvalidBats = errors.New(
		"bats must be R, L, or B",
	)

	ErrInvalidThrows = errors.New(
		"throws must be R or L",
	)

	ErrInvalidBirthYearRange = errors.New(
		"invalid birth year range",
	)

	ErrInvalidHeightRange = errors.New(
		"invalid height range",
	)

	ErrInvalidWeightRange = errors.New(
		"invalid weight range",
	)

	ErrPlayerNotFound = errors.New(
		"player not found",
	)
)

type PlayerService struct {
	repository *repository.PlayerRepository
}

func NewPlayerService(
	repository *repository.PlayerRepository,
) *PlayerService {
	return &PlayerService{
		repository: repository,
	}
}

// ========================================================
// PLAYER LIST RESULT
// ========================================================

type PlayerListResult struct {
	Players      []db.Person
	Page         int
	Limit        int
	TotalPlayers int64
	TotalPages   int
}

// ========================================================
// GET ALL PLAYERS
//
// Supports:
//
// Pagination:
//   page
//   limit
//
// Search:
//   search
//
// Filters:
//   birthCountry
//   birthState
//   bats
//   throws
//   minBirthYear
//   maxBirthYear
//   minHeight
//   maxHeight
//   minWeight
//   maxWeight
//
// Sorting:
//   sortBy=firstName
//   sortBy=birthYear
//   sortBy=height
//
// Direction:
//   sortOrder=asc
//   sortOrder=desc
//
// Example:
//
// /players?page=1&limit=20
//
// /players?page=1&limit=20&sortBy=firstName&sortOrder=asc
//
// /players?page=1&limit=20&birthCountry=USA&bats=R
//
// /players?page=1&limit=20&minHeight=70&maxHeight=76
// ========================================================

func (s *PlayerService) GetAllPlayers(
	ctx context.Context,
	page int,
	limit int,
	search string,
	birthCountry string,
	birthState string,
	bats string,
	throws string,
	minBirthYear *int32,
	maxBirthYear *int32,
	minHeight *int32,
	maxHeight *int32,
	minWeight *int32,
	maxWeight *int32,
	sortBy string,
	sortOrder string,
) (*PlayerListResult, error) {

	// ====================================================
	// PAGE VALIDATION
	// ====================================================

	if page < 1 {
		return nil, ErrInvalidPage
	}

	// ====================================================
	// LIMIT VALIDATION
	// ====================================================

	if limit < 1 {
		return nil, ErrInvalidLimit
	}

	// Maximum 100 records per request.
	if limit > 100 {
		limit = 100
	}

	// ====================================================
	// CLEAN STRING INPUTS
	// ====================================================

	search = strings.TrimSpace(search)

	birthCountry =
		strings.TrimSpace(birthCountry)

	birthState =
		strings.TrimSpace(birthState)

	bats =
		strings.ToUpper(
			strings.TrimSpace(bats),
		)

	throws =
		strings.ToUpper(
			strings.TrimSpace(throws),
		)

	sortBy =
		strings.TrimSpace(sortBy)

	sortOrder =
		strings.ToLower(
			strings.TrimSpace(sortOrder),
		)

	// ====================================================
	// DEFAULT SORT
	// ====================================================

	if sortOrder == "" {
		sortOrder = "asc"
	}

	// ====================================================
	// SORT VALIDATION
	// ====================================================

	if sortBy != "" {

		if sortBy != "firstName" &&
			sortBy != "birthYear" &&
			sortBy != "height" {

			return nil, ErrInvalidSortBy
		}
	}

	if sortOrder != "asc" &&
		sortOrder != "desc" {

		return nil, ErrInvalidSortOrder
	}

	// ====================================================
	// BATS VALIDATION
	//
	// Allowed:
	// R = Right
	// L = Left
	// B = Both
	// ====================================================

	if bats != "" {

		if bats != "R" &&
			bats != "L" &&
			bats != "B" {

			return nil, ErrInvalidBats
		}
	}

	// ====================================================
	// THROWS VALIDATION
	//
	// Allowed:
	// R = Right
	// L = Left
	// ====================================================

	if throws != "" {

		if throws != "R" &&
			throws != "L" {

			return nil, ErrInvalidThrows
		}
	}

	// ====================================================
	// BIRTH YEAR RANGE VALIDATION
	// ====================================================

	if minBirthYear != nil &&
		maxBirthYear != nil {

		if *minBirthYear >
			*maxBirthYear {

			return nil,
				ErrInvalidBirthYearRange
		}
	}

	// ====================================================
	// HEIGHT RANGE VALIDATION
	// ====================================================

	if minHeight != nil &&
		maxHeight != nil {

		if *minHeight >
			*maxHeight {

			return nil,
				ErrInvalidHeightRange
		}
	}

	// ====================================================
	// WEIGHT RANGE VALIDATION
	// ====================================================

	if minWeight != nil &&
		maxWeight != nil {

		if *minWeight >
			*maxWeight {

			return nil,
				ErrInvalidWeightRange
		}
	}

	// ====================================================
	// OFFSET
	// ====================================================

	offset := (page - 1) * limit

	// ====================================================
	// COUNT FILTERED PLAYERS
	//
	// IMPORTANT:
	// Count uses exactly the same filters as
	// GetAllPlayers.
	// ====================================================

	totalPlayers, err :=
		s.repository.CountPlayers(
			ctx,
			search,
			birthCountry,
			birthState,
			bats,
			throws,
			minBirthYear,
			maxBirthYear,
			minHeight,
			maxHeight,
			minWeight,
			maxWeight,
		)

	if err != nil {
		return nil, err
	}

	// ====================================================
	// GET FILTERED + SORTED + PAGINATED PLAYERS
	// ====================================================

	players, err :=
		s.repository.GetAllPlayers(
			ctx,
			int32(limit),
			int32(offset),
			search,
			birthCountry,
			birthState,
			bats,
			throws,
			minBirthYear,
			maxBirthYear,
			minHeight,
			maxHeight,
			minWeight,
			maxWeight,
			sortBy,
			sortOrder,
		)

	if err != nil {
		return nil, err
	}

	// ====================================================
	// TOTAL PAGES
	// ====================================================

	totalPages := 0

	if totalPlayers > 0 {

		totalPages = int(
			math.Ceil(
				float64(totalPlayers) /
					float64(limit),
			),
		)
	}

	// ====================================================
	// RESULT
	// ====================================================

	return &PlayerListResult{
		Players:      players,
		Page:         page,
		Limit:        limit,
		TotalPlayers: totalPlayers,
		TotalPages:   totalPages,
	}, nil
}

// ========================================================
// GET PLAYER BY ID
// ========================================================

func (s *PlayerService) GetPlayerByID(
	ctx context.Context,
	playerID string,
) (db.Person, error) {

	playerID =
		strings.TrimSpace(playerID)

	if playerID == "" {
		return db.Person{}, ErrPlayerNotFound
	}

	player, err :=
		s.repository.GetPlayerByID(
			ctx,
			playerID,
		)

	if err != nil {

		if errors.Is(
			err,
			sql.ErrNoRows,
		) {
			return db.Person{}, ErrPlayerNotFound
		}

		if errors.Is(
			err,
			repository.ErrPlayerNotFound,
		) {
			return db.Person{}, ErrPlayerNotFound
		}

		return db.Person{}, err
	}

	return player, nil
}

// ========================================================
// UPDATE PLAYER
// ========================================================

func (s *PlayerService) UpdatePlayer(
	ctx context.Context,
	playerID string,
	nameFirst string,
	nameLast string,
	nameGiven string,
	birthYear *int32,
	birthMonth *int32,
	birthDay *int32,
	birthCountry string,
	birthState string,
	birthCity string,
	weight *int32,
	height *int32,
	bats string,
	throws string,
	debut string,
	finalGame string,
) error {

	playerID =
		strings.TrimSpace(playerID)

	if playerID == "" {
		return ErrPlayerNotFound
	}

	// ====================================================
	// STRING → sql.NullString
	// ====================================================

	toNullString :=
		func(value string) sql.NullString {

			value =
				strings.TrimSpace(value)

			if value == "" {
				return sql.NullString{}
			}

			return sql.NullString{
				String: value,
				Valid:  true,
			}
		}

	// ====================================================
	// *int32 → sql.NullInt32
	// ====================================================

	toNullInt32 :=
		func(value *int32) sql.NullInt32 {

			if value == nil {
				return sql.NullInt32{}
			}

			return sql.NullInt32{
				Int32: *value,
				Valid: true,
			}
		}

	// ====================================================
	// CHECK PLAYER EXISTS
	// ====================================================

	_, err :=
		s.repository.GetPlayerByID(
			ctx,
			playerID,
		)

	if err != nil {

		if errors.Is(
			err,
			sql.ErrNoRows,
		) ||
			errors.Is(
				err,
				repository.ErrPlayerNotFound,
			) {

			return ErrPlayerNotFound
		}

		return err
	}

	// ====================================================
	// UPDATE PLAYER
	// ====================================================

	err = s.repository.UpdatePlayer(
		ctx,
		playerID,

		toNullString(nameFirst),

		toNullString(nameLast),

		toNullString(nameGiven),

		toNullInt32(birthYear),

		toNullInt32(birthMonth),

		toNullInt32(birthDay),

		toNullString(birthCountry),

		toNullString(birthState),

		toNullString(birthCity),

		toNullInt32(weight),

		toNullInt32(height),

		toNullString(bats),

		toNullString(throws),

		toNullString(debut),

		toNullString(finalGame),
	)

	if err != nil {
		return err
	}

	return nil
}
