package routes

import (
	"github.com/gin-gonic/gin"

	"players_task/handler"
)

func RegisterPlayerRoutes(
	router *gin.Engine,
	playerHandler *handlers.PlayerHandler,
) {
	router.GET(
		"/players",
		playerHandler.GetAllPlayers,
	)

	router.GET(
		"/players/:id",
		playerHandler.GetPlayerByID,
	)
	router.PUT("/players/:id", playerHandler.UpdatePlayer)
}
