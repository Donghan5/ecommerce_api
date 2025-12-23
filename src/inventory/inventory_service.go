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
func (s *InventoryService) CheckInventory(variantId string) (int, error) {
	query := "SELECT stock FROM inventory WHERE variant_id = $1"
	
	var stock int
	
	err := s.DB.QueryRow(query, variantId).Scan(&stock)
	if err != nil {
		log.Println("Error scanning row:", err)
		return 0, err
	}
	return stock, nil
}
