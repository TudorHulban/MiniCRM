package models

// Resource is used in events. Can be consumed by event (ex. linear - cable, piece - nut) or not (ex. vehicle).
type Resource struct {
	ID           int64
	Type         int // have a mapping of types
	Description  string
	AssignedEvID int64 // event to which resource is currently assigned
}

type ResourceMove struct {
	ID           int64
	ResourceID   int64
	AssignedEvID int64
	From         int64
	To           int64
	Quantity     int
}

var resourceTypes map[int]string

func (b *Blog) AddResource(pResource *Resource) error {
	return b.DBConn.Insert(pResource)
}

func (b *Blog) AssignResource(pResourceMove *ResourceMove) error {
	return b.DBConn.Insert(pResourceMove)
}
