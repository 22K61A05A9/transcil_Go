package handlers

import (
	"errors"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"players_task/response"
	"players_task/service"
)

type PlayerHandler struct {
	service *services.PlayerService
}

func NewPlayerHandler(
	playerService *services.PlayerService,
) *PlayerHandler {
	return &PlayerHandler{
		service: playerService,
	}
}

// ========================================================
// GET /players
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
// Examples:
//
// /players?page=1&limit=20
//
// /players?page=1&limit=20&search=da
//
// /players?page=1&limit=20&sortBy=firstName&sortOrder=asc
//
// /players?page=1&limit=20&birthCountry=USA
//
// /players?page=1&limit=20&birthCountry=USA&bats=R
//
// /players?page=1&limit=20&minHeight=70&maxHeight=76
//
// /players?page=1&limit=20&minWeight=180&maxWeight=210
//
// ========================================================

func (h *PlayerHandler) GetAllPlayers(
	c *gin.Context,
) {

	// ====================================================
	// PAGE
	// ====================================================

	page, err := strconv.Atoi(
		c.DefaultQuery("page", "1"),
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "page must be a positive integer",
		})
		return
	}

	// ====================================================
	// LIMIT
	// ====================================================

	limit, err := strconv.Atoi(
		c.DefaultQuery("limit", "20"),
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "limit must be a positive integer",
		})
		return
	}

	// ====================================================
	// SEARCH
	// ====================================================

	search := c.Query("search")

	// ====================================================
	// FILTERS
	// ====================================================

	birthCountry :=
		c.Query("birthCountry")

	birthState :=
		c.Query("birthState")

	bats :=
		c.Query("bats")

	throws :=
		c.Query("throws")

	// ====================================================
	// OPTIONAL INTEGER FILTER HELPER
	// ====================================================

	parseOptionalInt32 :=
		func(
			queryName string,
		) (*int32, error) {

			value :=
				strings.TrimSpace(
					c.Query(queryName),
				)

			// No value means no filter.
			if value == "" {
				return nil, nil
			}

			parsed, err :=
				strconv.ParseInt(
					value,
					10,
					32,
				)

			if err != nil {
				return nil, errors.New(
					queryName +
						" must be a valid integer",
				)
			}

			result :=
				int32(parsed)

			return &result, nil
		}

	// ====================================================
	// BIRTH YEAR RANGE
	// ====================================================

	minBirthYear, err :=
		parseOptionalInt32(
			"minBirthYear",
		)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	maxBirthYear, err :=
		parseOptionalInt32(
			"maxBirthYear",
		)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	// ====================================================
	// HEIGHT RANGE
	// ====================================================

	minHeight, err :=
		parseOptionalInt32(
			"minHeight",
		)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	maxHeight, err :=
		parseOptionalInt32(
			"maxHeight",
		)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	// ====================================================
	// WEIGHT RANGE
	// ====================================================

	minWeight, err :=
		parseOptionalInt32(
			"minWeight",
		)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	maxWeight, err :=
		parseOptionalInt32(
			"maxWeight",
		)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	// ====================================================
	// SORTING
	// ====================================================

	sortBy :=
		c.Query("sortBy")

	sortOrder :=
		c.DefaultQuery(
			"sortOrder",
			"asc",
		)

	// ====================================================
	// CALL SERVICE
	// ====================================================

	result, err :=
		h.service.GetAllPlayers(
			c.Request.Context(),

			page,
			limit,

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

		// ==================================================
		// PAGE / LIMIT ERROR
		// ==================================================

		if errors.Is(
			err,
			services.ErrInvalidPage,
		) ||
			errors.Is(
				err,
				services.ErrInvalidLimit,
			) {

			c.JSON(
				http.StatusBadRequest,
				gin.H{
					"error": err.Error(),
				},
			)

			return
		}

		// ==================================================
		// SORT FIELD ERROR
		// ==================================================

		if errors.Is(
			err,
			services.ErrInvalidSortBy,
		) {

			c.JSON(
				http.StatusBadRequest,
				gin.H{
					"error": err.Error(),
				},
			)

			return
		}

		// ==================================================
		// SORT ORDER ERROR
		// ==================================================

		if errors.Is(
			err,
			services.ErrInvalidSortOrder,
		) {

			c.JSON(
				http.StatusBadRequest,
				gin.H{
					"error": err.Error(),
				},
			)

			return
		}

		// ==================================================
		// BATS ERROR
		// ==================================================

		if errors.Is(
			err,
			services.ErrInvalidBats,
		) {

			c.JSON(
				http.StatusBadRequest,
				gin.H{
					"error": err.Error(),
				},
			)

			return
		}

		// ==================================================
		// THROWS ERROR
		// ==================================================

		if errors.Is(
			err,
			services.ErrInvalidThrows,
		) {

			c.JSON(
				http.StatusBadRequest,
				gin.H{
					"error": err.Error(),
				},
			)

			return
		}

		// ==================================================
		// BIRTH YEAR RANGE ERROR
		// ==================================================

		if errors.Is(
			err,
			services.ErrInvalidBirthYearRange,
		) {

			c.JSON(
				http.StatusBadRequest,
				gin.H{
					"error": err.Error(),
				},
			)

			return
		}

		// ==================================================
		// HEIGHT RANGE ERROR
		// ==================================================

		if errors.Is(
			err,
			services.ErrInvalidHeightRange,
		) {

			c.JSON(
				http.StatusBadRequest,
				gin.H{
					"error": err.Error(),
				},
			)

			return
		}

		// ==================================================
		// WEIGHT RANGE ERROR
		// ==================================================

		if errors.Is(
			err,
			services.ErrInvalidWeightRange,
		) {

			c.JSON(
				http.StatusBadRequest,
				gin.H{
					"error": err.Error(),
				},
			)

			return
		}

		// ==================================================
		// INTERNAL ERROR
		// ==================================================

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "failed to retrieve players",
			},
		)

		return
	}

	// ====================================================
	// CONVERT DATABASE MODELS
	// TO RESPONSE MODELS
	// ====================================================

	playerResponses := make(
		[]response.PlayerResponse,
		0,
		len(result.Players),
	)

	for _, player := range result.Players {

		playerResponses =
			append(
				playerResponses,
				response.ToPlayerResponse(
					player,
				),
			)
	}

	// ====================================================
	// FINAL RESPONSE
	// ====================================================

	apiResponse :=
		response.PlayerListResponse{
			Data: playerResponses,

			Pagination: response.PaginationResponse{
				Page: result.Page,

				Limit: result.Limit,

				TotalPlayers: result.TotalPlayers,

				TotalPages: result.TotalPages,
			},
		}

	c.JSON(
		http.StatusOK,
		apiResponse,
	)
}

// ========================================================
// GET /players/:id
// ========================================================

func (h *PlayerHandler) GetPlayerByID(
	c *gin.Context,
) {

	playerID :=
		c.Param("id")

	player, err :=
		h.service.GetPlayerByID(
			c.Request.Context(),
			playerID,
		)

	if err != nil {

		if errors.Is(
			err,
			services.ErrPlayerNotFound,
		) {

			c.JSON(
				http.StatusNotFound,
				gin.H{
					"error": "player not found",
				},
			)

			return
		}

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "failed to retrieve player",
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		response.ToPlayerResponse(
			player,
		),
	)
}

// ========================================================
// UPDATE PLAYER REQUEST
// ========================================================

type UpdatePlayerRequest struct {
	NameFirst    string `json:"nameFirst"`
	NameLast     string `json:"nameLast"`
	NameGiven    string `json:"nameGiven"`
	BirthYear    *int32 `json:"birthYear"`
	BirthMonth   *int32 `json:"birthMonth"`
	BirthDay     *int32 `json:"birthDay"`
	BirthCountry string `json:"birthCountry"`
	BirthState   string `json:"birthState"`
	BirthCity    string `json:"birthCity"`
	Weight       *int32 `json:"weight"`
	Height       *int32 `json:"height"`
	Bats         string `json:"bats"`
	Throws       string `json:"throws"`
	Debut        string `json:"debut"`
	FinalGame    string `json:"finalGame"`
}

// ========================================================
// VALIDATION
// ========================================================

func validateUpdatePlayerRequest(
	request UpdatePlayerRequest,
) map[string]string {

	validationErrors :=
		make(map[string]string)

	namePattern :=
		regexp.MustCompile(
			`^[A-Za-z\s'-]+$`,
		)

	// ====================================================
	// FIRST NAME
	// ====================================================

	nameFirst :=
		strings.TrimSpace(
			request.NameFirst,
		)

	if nameFirst == "" {

		validationErrors["nameFirst"] =
			"First name is required."

	} else if len([]rune(nameFirst)) < 2 {

		validationErrors["nameFirst"] =
			"First name must contain at least 2 characters."

	} else if !namePattern.MatchString(
		nameFirst,
	) {

		validationErrors["nameFirst"] =
			"First name can contain only letters."
	}

	// ====================================================
	// LAST NAME
	// ====================================================

	nameLast :=
		strings.TrimSpace(
			request.NameLast,
		)

	if nameLast == "" {

		validationErrors["nameLast"] =
			"Last name is required."

	} else if len([]rune(nameLast)) < 2 {

		validationErrors["nameLast"] =
			"Last name must contain at least 2 characters."

	} else if !namePattern.MatchString(
		nameLast,
	) {

		validationErrors["nameLast"] =
			"Last name can contain only letters."
	}

	// ====================================================
	// GIVEN NAME
	// ====================================================

	nameGiven :=
		strings.TrimSpace(
			request.NameGiven,
		)

	if nameGiven != "" &&
		!namePattern.MatchString(
			nameGiven,
		) {

		validationErrors["nameGiven"] =
			"Given name can contain only letters."
	}

	// ====================================================
	// BIRTH YEAR
	// ====================================================

	currentYear :=
		int32(time.Now().Year())

	if request.BirthYear != nil {

		if *request.BirthYear < 1800 ||
			*request.BirthYear >
				currentYear {

			validationErrors["birthYear"] =
				"Birth year must be between 1800 and the current year."
		}
	}

	// ====================================================
	// BIRTH MONTH
	// ====================================================

	if request.BirthMonth != nil {

		if *request.BirthMonth < 1 ||
			*request.BirthMonth > 12 {

			validationErrors["birthMonth"] =
				"Birth month must be between 1 and 12."
		}
	}

	// ====================================================
	// BIRTH DAY
	// ====================================================

	if request.BirthDay != nil {

		if *request.BirthDay < 1 ||
			*request.BirthDay > 31 {

			validationErrors["birthDay"] =
				"Birth day must be between 1 and 31."
		}
	}

	// ====================================================
	// BIRTH COUNTRY
	// ====================================================

	if strings.TrimSpace(
		request.BirthCountry,
	) == "" {

		validationErrors["birthCountry"] =
			"Birth country is required."
	}

	// ====================================================
	// BIRTH CITY
	// ====================================================

	if strings.TrimSpace(
		request.BirthCity,
	) == "" {

		validationErrors["birthCity"] =
			"Birth city is required."
	}

	// ====================================================
	// WEIGHT
	// ====================================================

	if request.Weight != nil &&
		*request.Weight <= 0 {

		validationErrors["weight"] =
			"Weight must be greater than 0."
	}

	// ====================================================
	// HEIGHT
	// ====================================================

	if request.Height != nil &&
		*request.Height <= 0 {

		validationErrors["height"] =
			"Height must be greater than 0."
	}

	// ====================================================
	// BATS
	// ====================================================

	bats :=
		strings.ToUpper(
			strings.TrimSpace(
				request.Bats,
			),
		)

	if bats != "" &&
		bats != "R" &&
		bats != "L" &&
		bats != "B" {

		validationErrors["bats"] =
			"Bats must be R, L, or B."
	}

	// ====================================================
	// THROWS
	// ====================================================

	throws :=
		strings.ToUpper(
			strings.TrimSpace(
				request.Throws,
			),
		)

	if throws != "" &&
		throws != "R" &&
		throws != "L" {

		validationErrors["throws"] =
			"Throws must be R or L."
	}

	// ====================================================
	// DEBUT
	// ====================================================

	debut :=
		strings.TrimSpace(
			request.Debut,
		)

	if debut != "" {

		if _, err :=
			time.Parse(
				"2006-01-02",
				debut,
			); err != nil {

			validationErrors["debut"] =
				"Debut must use YYYY-MM-DD format."
		}
	}

	// ====================================================
	// FINAL GAME
	// ====================================================

	finalGame :=
		strings.TrimSpace(
			request.FinalGame,
		)

	if finalGame != "" {

		if _, err :=
			time.Parse(
				"2006-01-02",
				finalGame,
			); err != nil {

			validationErrors["finalGame"] =
				"Final game must use YYYY-MM-DD format."
		}
	}

	return validationErrors
}

// ========================================================
// PUT /players/:id
// ========================================================

func (h *PlayerHandler) UpdatePlayer(
	c *gin.Context,
) {

	playerID :=
		c.Param("id")

	var request UpdatePlayerRequest

	// ====================================================
	// READ JSON
	// ====================================================

	if err :=
		c.ShouldBindJSON(
			&request,
		); err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "invalid request body",
			},
		)

		return
	}

	// ====================================================
	// VALIDATION
	// ====================================================

	validationErrors :=
		validateUpdatePlayerRequest(
			request,
		)

	if len(validationErrors) > 0 {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "validation failed",

				"fields": validationErrors,
			},
		)

		return
	}

	// ====================================================
	// UPDATE
	// ====================================================

	err := h.service.UpdatePlayer(
		c.Request.Context(),

		playerID,

		request.NameFirst,
		request.NameLast,
		request.NameGiven,

		request.BirthYear,
		request.BirthMonth,
		request.BirthDay,

		request.BirthCountry,
		request.BirthState,
		request.BirthCity,

		request.Weight,
		request.Height,

		request.Bats,
		request.Throws,

		request.Debut,
		request.FinalGame,
	)

	if err != nil {

		if errors.Is(
			err,
			services.ErrPlayerNotFound,
		) {

			c.JSON(
				http.StatusNotFound,
				gin.H{
					"error": "player not found",
				},
			)

			return
		}

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "failed to update player",
			},
		)

		return
	}

	// ====================================================
	// RETURN UPDATED PLAYER
	// ====================================================

	player, err :=
		h.service.GetPlayerByID(
			c.Request.Context(),
			playerID,
		)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "player updated but failed to retrieve updated player",
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		response.ToPlayerResponse(
			player,
		),
	)
}
