// Package interfaces provides decoupling interfaces.
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
