package models

import (
	"time"

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
	return pUser.DBConn.Insert(pEvent)
}

func (*Eventpg) GetEventbyPK(pID int64) (s.Event, error) {
	result := Event{ID: pID}
	errSelect := b.DBConn.Select(&result)
	return result, errSelect
}

func (b *Eventpg) GetEventsByTicketID(pID int64, pHowMany int) ([]Event, error) {
	var result []Event
	requester, errSelectRequester := getRequesterSecurityGroup(b, 1)
	if errSelectRequester != nil {
		return result, errSelectRequester
	}
	var errSelect error
	switch requester.SecurityGroup {
	case 1:
		{
			errSelect = b.DBConn.Model(&result).Order("id DESC").Where("ticketid = ?", pID).Limit(pHowMany).Select()
		}
	default:
		{
			errSelect = b.DBConn.Model(&result).Order("id DESC").Where("teamid = ?", requester.TeamID).Where("ticketid = ?", pID).Limit(pHowMany).Select()
		}
	}
	return result, errSelect
}

// GetUserPosts fetches posts for specific user, reverse order, latest first.
func (b *Eventpg) GetEventsByUserID(pUserID int64, pHowMany int) ([]Event, error) {
	var result []Event
	requester, errSelectRequester := getRequesterSecurityGroup(b, 1)
	if errSelectRequester != nil {
		return result, errSelectRequester
	}
	var errSelect error
	switch requester.SecurityGroup {
	case 1:
		{
			errSelect = b.DBConn.Model(&result).Order("id DESC").Where("userid = ?", pUserID).Limit(pHowMany).Select()
		}
	default:
		{
			errSelect = b.DBConn.Model(&result).Order("id DESC").Where("teamid = ?", requester.TeamID).Where("userid = ?", pUserID).Limit(pHowMany).Select()
		}
	}
	return result, errSelect
}

// GetLatestEvents fetches last posts from all users, reverse order, latest first. Security rights are taken into consideration.
func (b *Eventpg) GetLatestEvents(pRequesterUserID int64, pHowMany int) ([]Event, error) {
	var result []Event
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

func (b *Eventpg) GetMaxIDEvents() (int64, error) {
	var maxID struct {
		Max int64
	}
	_, errQuery := b.DBConn.QueryOne(&maxID, "select max(id) from posts")
	return maxID.Max, errQuery
}

func (b *Eventpg) UpdateEvent(pEvent *Event) error {
	return b.DBConn.Update(pEvent)
}