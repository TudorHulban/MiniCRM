package models

import (
	"time"

	s "../structs"
)

// Ticketpg type would satisfy RDBMSTicket interface.
type Ticketpg s.Ticket

func (*Ticketpg) Add(pTicket *s.Ticket) error {
	pTicket.Opened = time.Now().UnixNano()
	u, errGetUser := b.GetUserByPK(pTicket.OpenedByUserID)
	if errGetUser != nil {
		return errGetUser
	}
	pTicket.OpenedByTeamID = u.TeamID
	return b.DBConn.Insert(pTicket)
}

func (*Ticketpg) GetLastTickets(pHowMany int) ([]s.Ticket, error) {
	var result []s.Ticket
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
