package handlers

import (
	"errors"
	"net/http"
	"strconv"

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

// GET /players?limit=20&token=<opaque-token>
func (h *PlayerHandler) GetAllPlayers(c *gin.Context) {

	// ========================================================
	// GET LIMIT
	// ========================================================

	limit, err := strconv.Atoi(
		c.DefaultQuery("limit", "20"),
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "limit must be a positive integer",
		})
		return
	}

	// ========================================================
	// GET TOKEN
	// ========================================================
	//
	// First request:
	//
	// GET /players?limit=20
	//
	// token = ""
	//
	// Next request:
	//
	// GET /players?limit=20&token=<opaque-token>
	//
	// The frontend does NOT send lastName or
	// lastPlayerID directly.
	//

	token := c.Query("token")

	// ========================================================
	// GET PLAYERS
	// ========================================================

	result, err := h.service.GetPlayersByToken(
		c.Request.Context(),
		token,
		limit,
	)

	if err != nil {

		// Invalid limit.
		if errors.Is(
			err,
			services.ErrInvalidLimit,
		) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		// Invalid token.
		if errors.Is(
			err,
			services.ErrInvalidToken,
		) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid pagination token",
			})
			return
		}

		// Don't expose internal database errors.
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to retrieve players",
		})
		return
	}

	// ========================================================
	// CONVERT DATABASE MODELS
	// TO API RESPONSE MODELS
	// ========================================================

	playerResponses := make(
		[]response.PlayerResponse,
		0,
		len(result.Players),
	)

	for _, player := range result.Players {

		playerResponses = append(
			playerResponses,
			response.ToPlayerResponse(player),
		)
	}

	// ========================================================
	// BUILD TOKEN RESPONSE
	// ========================================================

	apiResponse := response.TokenPlayerListResponse{
		Data: playerResponses,

		Pagination: response.TokenPaginationResponse{
			Limit:       result.Limit,
			NextToken:   result.NextToken,
			HasNextPage: result.HasNextPage,
		},
	}

	c.JSON(
		http.StatusOK,
		apiResponse,
	)
}

// GET /players/:id
func (h *PlayerHandler) GetPlayerByID(
	c *gin.Context,
) {

	playerID := c.Param("id")

	player, err := h.service.GetPlayerByID(
		c.Request.Context(),
		playerID,
	)

	if err != nil {

		if errors.Is(
			err,
			services.ErrPlayerNotFound,
		) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "player not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to retrieve player",
		})
		return
	}

	playerResponse :=
		response.ToPlayerResponse(player)

	c.JSON(
		http.StatusOK,
		playerResponse,
	)
}
