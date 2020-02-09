// Package interfaces provides decoupling interfaces.
package interfaces

import (
	s "../structs"
)

type RDBMSFile interface {
	Add(pFile *s.File) error
}
