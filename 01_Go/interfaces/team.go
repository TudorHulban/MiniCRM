// Package interfaces provides decoupling interfaces.
package interfaces

import (
	s "../structs"
)

// RDBMSTeam interface provides contract for team persistance.
type RDBMSTeam interface {
	Add(pTeam *s.Team) error
}
