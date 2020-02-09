// Package interfaces provides decoupling interfaces.
package interfaces

import (
	s "../structs"
)

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
