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

func (h *InventoryHandler) CheckStock(c *gin.Context) {
	variantId := c.Param("variant_id")
	stock, err := h.Service.CheckStock(variantId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"stock": stock})
}

func (h *InventoryHandler) IncreaseStock(c *gin.Context) {
	variantId := c.Param("variant_id")
	quantity := c.Query("quantity")

	err := h.Service.IncreaseStock(variantId, quantity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Stock increased successfully"})
}

func (h *InventoryHandler) DecreaseStock(c *gin.Context) {
	variantId := c.Param("variant_id")
	quantity := c.Query("quantity")

	err := h.Service.DecreaseStock(variantId, quantity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Stock decreased successfully"})
}

