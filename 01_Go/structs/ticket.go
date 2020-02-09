package structs

// TicketType abstracts a ticket type. Ticket contains events.
type TicketType struct {
	ID          int
	TypeCODE    string
	SLAID       int // service level agreement per type of ticket and customer
	Description string
}

// Ticket concentrates events.
type Ticket struct {
	ID              int64
	TypeCODE        int   // have a mapping of types
	OpenedByUserID  int64 `pg:"userid"`
	OpenedByTeamID  int   `pg:"teamid"`
	Opened          int64 `pg:"openednano"`
	Closed          int64 `pg:"closednano"`
	CurrentStatus   int   // ticket status ID
	CurrentPriority int
	CurrentUserID   int64 `pg:"assignedid"`
	Title           string
	Description     string
	Events          []Event `pg:"-"`
}

type TicketStatus struct {
	ID                     int
	TicketTypeID           int
	StatusCODE             string
	StatusDescription      string
	NOTAllowedNextStatusID []int64 `pg:"notnextstatusid"`
}

type TicketMovement struct {
	ID                      int64
	TicketID                int64
	Timestamp               int64
	PreviousStatus          int // ticket status ID
	ChangedToStatus         int // ticket status ID
	PreviousPriority        int
	ChangedToPriority       int
	PreviousAssignedUserID  int64
	ChangedToAssignedUserID int64
}
