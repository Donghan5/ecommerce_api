package product

import (
	"database/sql"
	"log"
	"time"
)

type Product struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	BasePrice float64   `json:"base_price"`
	CreatedAt time.Time `json:"created_at"`
}

// product service
type ProductService struct {
	DB *sql.DB
}

// Creating a new product service object (init function)
func NewProductService(db *sql.DB) *ProductService {
	return &ProductService{DB: db}
}

// apply method receiver and declare return type
func (s *ProductService) FindAllProducts() ([]Product, error) {
	rows, err := s.DB.Query("SELECT id, name, base_price, created_at FROM products")

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var products []Product

	for rows.Next() {
		var p Product

		if err := rows.Scan(&p.ID, &p.Name, &p.BasePrice, &p.CreatedAt); err != nil {
			log.Println("Error scanning row:", err)
			return nil, err
		}

		products = append(products, p)
	}

	return products, nil
}

// find product by productID
func (s *ProductService) FindByProductID(productID string) (*Product, error) {
	var p Product

	log.Println("Querying product by productID, and return product name and price")

	query := "SELECT id, name, base_price, created_at FROM products WHERE id = $1"

	// use QueryRow to query a single row
	err := s.DB.QueryRow(query, productID).Scan(&p.ID, &p.Name, &p.BasePrice, &p.CreatedAt)
	if err != nil {
		log.Println("Error scanning row:", err)
		return nil, err
	}
	return &p, nil
}

// find detail of product by productID
func (s *ProductService) FindNameAndPrice(productID string) (string, float64, error) {
	var name string
	var price float64

	err := s.DB.QueryRow("SELECT name, base_price FROM products WHERE id = $1", productID).Scan(&name, &price)
	if err != nil {
		log.Println("Error scanning row:", err)
		return "", 0, err
	}
	return name, price, nil
}

func (s *ProductService) findByFilter(filter string) ([]Product, error) {
	searchPattern := "%" + filter + "%"

	rows, err := s.DB.Query("SELECT id, name, base_price, created_at FROM products WHERE name LIKE $1", searchPattern)

	if err != nil {
		log.Println("Error scanning row:", err)
		return nil, err
	}

	defer rows.Close()

	var products []Product

	for rows.Next() {
		var p Product

		if err := rows.Scan(&p.ID, &p.Name, &p.BasePrice, &p.CreatedAt); err != nil {
			log.Println("Error scanning row:", err)
			return nil, err
		}

		products = append(products, p)
	}

	return products, nil
}
