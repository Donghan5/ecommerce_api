package inventory

import (
	"database/sql"
	"log"
)

type InventoryService struct {
	DB *sql.DB
}

func NewInventoryService(db *sql.DB) *InventoryService {
	return &InventoryService{DB: db}
}

// check inventory (quantity)
func (s *InventoryService) CheckStock(variantId string) (int, error) {
	query := "SELECT quantity_available FROM inventory WHERE variant_id = $1"
	
	var stock int
	
	err := s.DB.QueryRow(query, variantId).Scan(&stock)
	if err != nil {
		log.Println("Error scanning row:", err)
		return 0, err
	}
	return stock, nil
}

// When the client reject the order, the stock should be increased
func (s *InventoryService) IncreaseStock(variantId string, quantity int) error {
	query := "UPDATE inventory SET quantity_available = quantity_available + $1 WHERE variant_id = $2"
	
	_, err := s.DB.Exec(query, quantity, variantId)
	if err != nil {
		log.Println("Error updating stock:", err)
		return err
	}
	return nil
}

// When the client accept the order, the stock should be decreased
func (s *InventoryService) DecreaseStock(variantId string, quantity int) error {
	query := "UPDATE inventory SET quantity_available = quantity_available - $1 WHERE variant_id = $2 AND quantity_available >= $1"
	
	result, err := s.DB.Exec(query, quantity, variantId)
	if err != nil {
		log.Println("Error updating stock:", err)
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		log.Println("Not enough stock for variant", variantId)
	}
	
	return nil
}

