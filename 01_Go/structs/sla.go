package structs

// SLA type abstracts service level agreement information. Ex. Gold, Silver, Bronze.
type SLA struct {
	ID          int
	CODE        string
	Description string
}

// SLAPriority abstracts service level priority. Ex. High, Medium, Low.
type SLAPriority struct {
	ID          int
	CODE        string
	Description string
}

// SLAValues provides values for each priority of a SLA.
type SLAValue struct {
	ID               int
	SLAID            int
	SLAPriorityID    int
	SecondsToRespond int64
	SecondsToSolve   int64
}
