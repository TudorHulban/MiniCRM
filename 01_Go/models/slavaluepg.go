package models

import (
	s "../structs"
)

// File defines SLA value type for Pg persistance.

// SLApg type would satisfy RDBMSSLA interface.
type SLAValuepg s.SLAValue

func (*SLAValuepg) Add(pSLAValue *SLAValuepg) error {
	return b.DBConn.Insert(pSLAValue)
}
