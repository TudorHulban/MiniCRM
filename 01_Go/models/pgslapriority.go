package models

import (
	s "../structs"
)

// File defines SLA priority type for Pg persistance.

// SLAPrioritypg type would satisfy RDBMSSLAPriority interface.
type SLAPrioritypg s.SLAPriority

func (*SLAPrioritypg) Add(pPriority *SLAPrioritypg) error {
	return b.DBConn.Insert(pPriority)
}
