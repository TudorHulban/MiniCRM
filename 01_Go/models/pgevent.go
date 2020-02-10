package models

import (
	"time"

	db "../database" // provides RDBMS connection
	f "../interfaces"
	s "../structs"
)

// File defines Event type for Pg persistance.

// Eventpg type would satisfy RDBMSEvent interface.
type Eventpg s.Event

// AddEvent adds event to Pg. the ID of inserted row is populated after insert in the ID column.
func (*Eventpg) Add(pEvent *Eventpg, pUser f.RDBMSUser) error {
	pEvent.Opened = time.Now().UnixNano()

	u, errGetUser := pUser.GetUserByPK(pEvent.OpenedByUserID)
	if errGetUser != nil {
		return errGetUser
	}
	pEvent.OpenedByTeamID = u.TeamID
	return db.DBConn.Insert(pEvent)
}

func (*Eventpg) GetEventbyPK(pID int64) (s.Event, error) {
	result := s.Event{ID: pID}
	errSelect := db.DBConn.Select(&result)
	return result, errSelect
}

// GetEventsByTicketID provides events for a ticket regardless of user. Should add user ID for security.
func (*Eventpg) GetEventsByTicketID(pTicketID int64, pHowMany int) ([]s.Event, error) {
	var result []s.Event
	var security f.RDBMSSecurity
	securityGroupID, teamID, errSecurity := security.GetSecurity(int64(1))
	if errSecurity != nil {
		return result, errSecurity
	}
	var errSelect error
	switch securityGroupID {
	case 1:
		{
			errSelect = db.DBConn.Model(&result).Order("id DESC").Where("ticketid = ?", pTicketID).Limit(pHowMany).Select()
		}
	default:
		{
			errSelect = db.DBConn.Model(&result).Order("id DESC").Where("teamid = ?", teamID).Where("ticketid = ?", pTicketID).Limit(pHowMany).Select()
		}
	}
	return result, errSelect
}

// GetEventsByUserID fetches posts for specific user, reverse order, latest first.
func (*Eventpg) GetEventsByUserID(pUserID int64, pHowMany int) ([]s.Event, error) {
	var result []s.Event
	var security f.RDBMSSecurity
	securityGroupID, teamID, errSecurity := security.GetSecurity(pUserID)
	if errSecurity != nil {
		return result, errSecurity
	}
	var errSelect error
	switch securityGroupID {
	case 1:
		{
			errSelect = db.DBConn.Model(&result).Order("id DESC").Where("userid = ?", pUserID).Limit(pHowMany).Select()
		}
	default:
		{
			errSelect = db.DBConn.Model(&result).Order("id DESC").Where("teamid = ?", teamID).Where("userid = ?", pUserID).Limit(pHowMany).Select()
		}
	}
	return result, errSelect
}

// GetLatestEvents fetches last posts from all users, reverse order, latest first. Security rights are taken into consideration.
func (*Eventpg) GetLatestEvents(pRequesterUserID int64, pHowMany int) ([]s.Event, error) {
	var result []s.Event
	var security f.RDBMSSecurity
	securityGroupID, teamID, errSecurity := security.GetSecurity(pRequesterUserID)
	if errSecurity != nil {
		return result, errSecurity
	}
	var errSelect error
	switch securityGroupID {
	case 1:
		{
			errSelect = db.DBConn.Model(&result).Order("id DESC").Limit(pHowMany).Select()
		}
	default:
		{
			errSelect = db.DBConn.Model(&result).Order("id DESC").Where("teamid = ?", teamID).Select()
		}
	}
	return result, errSelect
}

func (*Eventpg) GetMaxIDEvents() (int64, error) {
	var maxID struct {
		Max int64
	}
	_, errQuery := db.DBConn.QueryOne(&maxID, "select max(id) from posts")
	return maxID.Max, errQuery
}

func (*Eventpg) UpdateEvent(pEvent *s.Event) error {
	return db.DBConn.Update(pEvent)
}
