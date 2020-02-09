// Package interfaces provides decoupling interfaces.
package interfaces

import (
	s "../structs"
)

type RDBMSTicket interface {
	Add(pTicket *s.Ticket) error
}
