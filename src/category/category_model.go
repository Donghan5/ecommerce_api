package category

// Row data from database
type CategoryRow struct {
	ID string `db:"id"`
	Name string `db:"name"`
	DisplayOrder int `db:"display_order"`
	ParentID *string `db:"parent_id"`
}

// tree node to send to client
type CategoryNode struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Children []*CategoryNode `json:"children"`
}