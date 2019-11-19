package main

type SLAPriority struct {
	ID          int
	CODE        string
	Description string
}

type SLA struct {
	ID          int
	CODE        string
	Description string
}

type SLAValues struct {
	ID               int
	SLAID            int
	SLAPriorityID    int
	SecondsToRespond int64
	SecondsToSolve   int64
}

// CRUD - Create

func (b *Blog) AddSLAPriority(pPriority *SLAPriority) error {
	return b.DBConn.Insert(pPriority)
}

func (b *Blog) AddSLA(pSLA *SLA) error {
	return b.DBConn.Insert(pSLA)
}

func (b *Blog) AddSLAValues(pSLAValues *SLAValues) error {
	return b.DBConn.Insert(pSLAValues)
}
