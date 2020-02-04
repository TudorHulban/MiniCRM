package models

import (
	"time"
)

type Event struct {
	ID                   int64
	TicketID             int64  `json:"ticketid" pg:"ticketid"`
	OpenedByUserID       int64  `json:"userid" pg:"userid"`
	OpenedByTeamID       int    `pg:"teamid"`
	Opened               int64  `pg:"openednano"`
	Title                string `json:"title"`
	Contents             string `json:"content"`
	BroadcastTeam        bool
	InformUserIDs        []int64 // user IDs to which to send the event by email
	EmailTo              []string
	EmailCC              []string
	UploadedFilesIDs     []int64 `pg:"filesid"`       // id of files uploaded with event
	AssignedResourcesIDs []int64 `pg:"assignresoid"`  // id of resources assigned with event
	ReleasedResourceIDs  []int64 `pg:"releaseresoid"` // id of resources released with event
}

// CRUD - C

// AddEvent adds event to DB. the ID of inserted row is populated after insert in the ID column.
func (b *Blog) AddEvent(pEvent *Event) error {
	pEvent.Opened = time.Now().UnixNano()

	u, errGetUser := b.GetUserByPK(pEvent.OpenedByUserID)
	if errGetUser != nil {
		return errGetUser
	}
	pEvent.OpenedByTeamID = u.TeamID
	return b.DBConn.Insert(pEvent)
}

// CRUD - R

func (b *Blog) GetEventbyPK(pID int64) (Event, error) {
	result := Event{ID: pID}
	errSelect := b.DBConn.Select(&result)
	return result, errSelect
}

func (b *Blog) GetEventsByTicketID(pID int64, pHowMany int) ([]Event, error) {
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
func (b *Blog) GetEventsByUserID(pUserID int64, pHowMany int) ([]Event, error) {
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
func (b *Blog) GetLatestEvents(pRequesterUserID int64, pHowMany int) ([]Event, error) {
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

func (b *Blog) GetMaxIDEvents() (int64, error) {
	var maxID struct {
		Max int64
	}
	_, errQuery := b.DBConn.QueryOne(&maxID, "select max(id) from posts")
	return maxID.Max, errQuery
}

// CRUD - U

func (b *Blog) UpdateEvent(pEvent *Event) error {
	return b.DBConn.Update(pEvent)
}