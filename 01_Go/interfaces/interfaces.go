// Package interf provides decoupling interfaces.
package interfaces

import (
	s "../structs"
)

// RDBMSUser interface provides contract for user persistance.
type RDBMSUser interface {
	Add(pUser *s.User) error
	GetUserByPK(pID int64) (s.User, error)
	GetUserByCodeUnauthorized(pCODE string) (s.User, error)
	GetUserByCode(pRequesterUserID int64, pCODE string) (s.User, error)
	GetAllUsers(pRequesterUserID int64, pHowMany int) ([]s.User, error)
	GetMaxIDUsers() (int64, error)
	UpdateUser(pUser *s.User) error
}

type RDBMSEvent interface {
	Add(pEvent *s.Event) error
	GetByPK(pID int64) (s.Event, error)
	GetByTicketID(pID int64, pHowMany int) ([]s.Event, error)
}

// RDBMSTeam interface provides contract for team persistance.
type RDBMSTeam interface {
	Add(pTeam *s.Team) error
}

// RDBMSSLA interface provides contract for service level agreement persistance.
type RDBMSSLA interface {
	Add(pSLA *s.SLA) error
}

// RDBMSSLAPriority interface provides contract for service level agreement priorities persistance.
type RDBMSSLAPriority interface {
	Add(pPriority *s.SLAPriority) error
}

// RDBMSSLAValue interface provides contract for service level agreement values persistance.
type RDBMSSLAValue interface {
	Add(pSLAValues *s.SLAValue) error
}
