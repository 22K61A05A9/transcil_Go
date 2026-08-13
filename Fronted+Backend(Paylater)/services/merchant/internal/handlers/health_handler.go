package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Health reports process liveness for orchestration probes.
func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
