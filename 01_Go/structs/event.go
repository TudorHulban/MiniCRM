package structs

type Event struct {
	BroadcastTeam  bool
	OpenedByTeamID int `pg:"teamid"`
	ID             int64
	TicketID       int64  `json:"ticketid" pg:"ticketid"`
	OpenedByUserID int64  `json:"userid" pg:"userid"`
	Opened         int64  `pg:"openednano"`
	Title          string `json:"title"`
	Contents       string `json:"content"`

	InformUserIDs        []int64 // user IDs to which to send the event by email
	UploadedFilesIDs     []int64 `pg:"filesid"`       // id of files uploaded with event
	AssignedResourcesIDs []int64 `pg:"assignresoid"`  // id of resources assigned with event
	ReleasedResourceIDs  []int64 `pg:"releaseresoid"` // id of resources released with event
	EmailTo              []string
	EmailCC              []string
}
