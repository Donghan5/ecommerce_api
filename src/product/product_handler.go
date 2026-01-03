package product

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	Service *ProductService
}

func NewProductHandler(service *ProductService) *ProductHandler {
	return &ProductHandler{Service: service}
}

// get all products (get request)
func (h *ProductHandler) GetAllProducts(c *gin.Context) {
	products, err := h.Service.FindAllProducts()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, products)
}

func (h *ProductHandler) GetProductByID(c *gin.Context) {
	id := c.Param("id")

	product, err := h.Service.FindByProductID(id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, product)
}

func (h *ProductHandler) GetProductByNameAndPrice(c *gin.Context) {
	productId := c.Param("id")

	name, price, err := h.Service.FindNameAndPrice(productId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"name": name, "base_price": price})
}