package cart

import (
	"net/http"
	"github.com/gin-gonic/gin"
)


type CartHandler struct {
	Service *CartService
}

func NewCartHandler(service *CartService) *CartHandler {
	return &CartHandler{Service: service}
}

func (h *CartHandler) AddToCart(c *gin.Context) {
	var req AddCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.Service.AddToCart(req.OrderId, req.ProductId, req.Quantity)
	c.JSON(http.StatusOK, gin.H{"message": "Item added to cart"})
}


func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	var req AddCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.Service.RemoveFromCart(req.OrderId, req.ProductId, req.Quantity)
	c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
}