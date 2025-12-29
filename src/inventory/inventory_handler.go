package inventory

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type StockUpdateRequest struct {
	VariantId string `json:"variant_id"`
	Quantity int `json:"quantity"`
}

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
	var req StockUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := h.Service.IncreaseStock(req.VariantId, req.Quantity) 
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Stock increased successfully"})
}

func (h *InventoryHandler) DecreaseStock(c *gin.Context) {
	var req StockUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := h.Service.DecreaseStock(req.VariantId, req.Quantity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Stock decreased successfully"})
}

