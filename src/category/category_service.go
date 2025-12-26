
package category

import (
	"context"
	"database/sql"
	"log"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

type CategoryService struct {
	DB *sql.DB
	RDB *redis.Client
}

func NewCategoryService(db *sql.DB, rdb *redis.Client) *CategoryService {
	return &CategoryService{DB: db, RDB: rdb}
}

func (s *CategoryService) GetCategoryTree(ctx context.Context) ([]*CategoryNode, error) {
	redisKey := "category_tree"

	val, err := s.RDB.Get(ctx, redisKey).Result()
	if err == nil {
		var tree []*CategoryNode
		json.Unmarshal([]byte(val), &tree)
		return tree, nil
	}

	log.Println("Start DB Query")
	rows, err := s.DB.QueryContext(ctx, "SELECT id, parent_id, name, display_order FROM categories ORDER BY display_order ASC")

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var categoryRows []CategoryRow

	for rows.Next() {
		var r CategoryRow

		if err := rows.Scan(&r.ID, &r.ParentID, &r.Name, &r.DisplayOrder); err != nil {
			continue
		}

		categoryRows = append(categoryRows, r)
	}

	tree := s.buildCategoryTree(categoryRows)

	jsonData, _ := json.Marshal(tree)
	s.RDB.Set(ctx, redisKey, jsonData, 30*time.Minute)

	return tree, nil
}

func (s *CategoryService) buildCategoryTree(rows []CategoryRow) []*CategoryNode {
	nodeMap := make(map[string]*CategoryNode)

	for _, row := range rows {
		nodeMap[row.ID] = &CategoryNode{
			ID: row.ID,
			Name: row.Name,
			Children: make([]*CategoryNode,0),
		}
	}

	var roots []*CategoryNode
	
	for _, row := range rows {
		currentNode := nodeMap[row.ID]

		if row.ParentID == nil {
			roots = append(roots, currentNode)
		} else {
			parentID := *row.ParentID
			if parentNode, exists := nodeMap[parentID]; exists {
				parentNode.Children = append(parentNode.Children, currentNode)
			} else {
				roots = append(roots, currentNode)
			}
		}
	}

	log.Println("Finished BuildCategoryTree", roots)

	return roots
}

