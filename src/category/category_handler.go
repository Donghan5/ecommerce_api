package category

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	CategoryService *CategoryService
}

func NewCategoryHandler(service *CategoryService) *CategoryHandler {
	return &CategoryHandler{CategoryService: service}
}

func (h *CategoryHandler) GetCategories(c *gin.Context) {
	tree, err := h.CategoryService.GetCategoryTree(c.Request.Context())
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tree)
}