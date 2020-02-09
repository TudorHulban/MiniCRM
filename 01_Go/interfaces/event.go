// Package interfaces provides decoupling interfaces.
package interfaces

import (
	s "../structs"
)

type RDBMSEvent interface {
	Add(pEvent *s.Event) error
	GetByPK(pID int64) (s.Event, error)
	GetByTicketID(pID int64, pHowMany int) ([]s.Event, error)
}
