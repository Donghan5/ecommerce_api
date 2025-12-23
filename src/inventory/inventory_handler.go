package inventory

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type InventoryHandler struct {
	Service *InventoryService
}

func NewInventoryHandler(service *InventoryService) *InventoryHandler {
	return &InventoryHandler{Service: service}
}

func (h *InventoryHandler) CheckInventory(c *gin.Context) {
	variantId := c.Param("variant_id")
	stock, err := h.Service.CheckInventory(variantId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"stock": stock})
}

