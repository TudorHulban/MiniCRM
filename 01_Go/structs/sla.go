package structs

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
