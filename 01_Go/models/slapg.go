package models

import (
	s "../structs"
)

// File defines SLA type for Pg persistance.

// SLApg type would satisfy RDBMSSLA interface.
type SLApg s.SLA

func (*SLApg) Add(pSLA *SLApg) error {
	return b.DBConn.Insert(pSLA)
}
