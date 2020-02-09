package models

import (
	s "../structs"
)

// File defines Team type for Pg persistance.

// SLAPrioritypg type would satisfy RDBMSSLAPriority interface.
type Teampg s.Team

func (*Teampg) Add(pTeam *Teampg) error {
	return b.DBConn.Insert(pTeam)
}
