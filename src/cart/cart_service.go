package cart

// This is a adding cart service (add item to cart)
import (
	"log"
	"database/sql" // postgresql
)

// data structure for add to cart
type AddCartRequest struct {
	OrderId string `json:"order_id"`
	ProductId string `json:"product_id"`
	Quantity int `json:"quantity"`
}


type CartService struct {
	DB *sql.DB
}

func NewCartService(db *sql.DB) *CartService {
	return &CartService{DB: db}
}

// add to cart (update the cart item?)
func (s *CartService) AddToCart(cartId string, productId string, quantity int) {
	// Check inventory table
	
	query := `
		INSERT INTO cart_items (cart_id, product_id, quantity)
		VALUES ($1, $2, $3)
		ON CONFLICT (cart_id, product_id)
		DO UPDATE SET quantity = cart_items.quantity + $3
	` 
	
	_, err := s.DB.Exec(query, cartId, productId, quantity)
	if err != nil {
		log.Println("Error adding to cart:", err)
		return
	}
}
	
// remove from cart (update the cart item?)
func (s *CartService) RemoveFromCart(cartId string, productId string, quantity int) {
	query := `
		DELETE FROM cart_items
		WHERE cart_id = $1 AND product_id = $2
	`
	
	_, err := s.DB.Exec(query, cartId, productId)
	if err != nil {
		log.Println("Error removing from cart:", err)
		return
	}
}

// Check the available quantity of a cart item
func (s *CartService) GetCartItemQuantity(cartId string, variantId string) (int, error) {
	query := `SELECT quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2`
	
	var quantity int
	
	err := s.DB.QueryRow(query, cartId, variantId).Scan(&quantity)
	if err != nil {
		log.Println("Error scanning row:", err)
		return 0, err
	}
	return quantity, nil
}