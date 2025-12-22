package main

// This is a adding cart service (add item to cart)
import (
	"log"
	"net/http"
	"database/sql" // postgresql
	"time"

	"github.com/gin-gonic/gin"
)

// data structure for add to cart
type AddCartRequest struct {
	VariantID string `json:"variant_id"`
	Quantity int `json:"quantity"`
}


func AddToCart(order_id string, product_id string, quantity int) {
	
}