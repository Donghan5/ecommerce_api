package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"

	"ecommerce_api/src/category"
	"ecommerce_api/src/inventory"
	"ecommerce_api/src/product"
)

func main() {
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("POSTGRES_HOST"),
		"5432",
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_DB"),
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}
	defer db.Close()

	// Wait for the database to be ready (simple retry mechanism)
	for i := 0; i < 10; i++ {
		if err = db.Ping(); err == nil {
			break
		}
		log.Println("Waiting for database to be ready...", err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	productService := product.NewProductService(db)
	productHandler := product.NewProductHandler(productService)

	categoryService := category.NewCategoryService(db, rdb)
	categoryHandler := category.NewCategoryHandler(categoryService)

	inventoryService := inventory.NewInventoryService(db)
	inventoryHandler := inventory.NewInventoryHandler(inventoryService)

	r := gin.Default()

	r.GET("/products", productHandler.GetAllProducts)
	r.GET("/products/:id", productHandler.GetProductByID)
	r.GET("/products/:id/details", productHandler.GetProductByNameAndPrice)

	r.GET("/categories", categoryHandler.GetCategories)

	r.GET("/inventory/check/:variant_id", inventoryHandler.CheckStock)

	r.POST("/inventory/increase", inventoryHandler.IncreaseStock)
	r.POST("/inventory/decrease", inventoryHandler.DecreaseStock)

	port := os.Getenv("GO_PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Go server running on port", port)
	r.Run(":" + port)
}
