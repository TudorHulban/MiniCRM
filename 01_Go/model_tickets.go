package main

import (
	"time"
)

type TicketType struct {
	ID          int
	TypeCODE    string
	SLAID       int // service level agreement per type of ticket and customer
	Description string
}

type TicketStatus struct {
	ID                     int
	TicketTypeID           int
	StatusCODE             string
	StatusDescription      string
	NOTAllowedNextStatusID []int64 `pg:"notnextstatusid"`
}

// Ticket concentrates events.
type Ticket struct {
	ID              int64
	TypeCODE        int   // have a mapping of types
	OpenedByUserID  int64 `pg:"userid"`
	OpenedByTeamID  int   `pg:"teamid"`
	Opened          int64 `pg:"openednano"`
	Closed          int64 `pg:"closednano"`
	CurrentStatus   int
	CurrentPriority int
	CurrentUserID   int64 `pg:"assignedid"`
	Title           string
	Description     string
	Events          []Event `pg:"-"`
}

type TicketMovement struct {
	ID                      int64
	TicketID                int64
	Timestamp               int64
	PreviousStatus          int
	ChangedToStatus         int
	PreviousPriority        int
	ChangedToPriority       int
	PreviousAssignedUserID  int64
	ChangedToAssignedUserID int64
}

// CRUD - Create

func (b *Blog) AddTicket(pTicket *Ticket) error {
	pTicket.Opened = time.Now().UnixNano()
	u, errGetUser := b.GetUserByPK(pTicket.OpenedByUserID)
	if errGetUser != nil {
		return errGetUser
	}
	pTicket.OpenedByTeamID = u.TeamID
	return b.DBConn.Insert(pTicket)
}

// CRUD - Read

func (b *Blog) GetLastTickets(pHowMany int) ([]Ticket, error) {
	var result []Ticket
	requester, errSelectRequester := getRequesterSecurityGroup(b, 1)
	if errSelectRequester != nil {
		return result, errSelectRequester
	}
	var errSelect error
	switch requester.SecurityGroup {
	case 1:
		{
			errSelect = b.DBConn.Model(&result).Order("id DESC").Limit(pHowMany).Select()
		}
	default:
		{
			errSelect = b.DBConn.Model(&result).Order("id DESC").Where("teamid = ?", requester.TeamID).Select()
		}
	}
	return result, errSelect
}

// Helpers

func addTicketType(b *Blog, pData *TicketType) error {
	return b.DBConn.Insert(pData)
}

func addTypeTickStatus(b *Blog, pData *TicketStatus) error {
	return b.DBConn.Insert(pData)
}
