package models

import (
	db "../database"
	s "../structs"
)

// File defines Security type for Pg persistance.

// Securitypg type would satisfy RDBMSSecurity interface.
type Securitypg s.Security

func (*Securitypg) GetSecurityGroup(pID int64) (int64, int64, error) {
	result := new(s.User)
	result.ID = pID
	errSelect := db.DBConn.Select(result)
	return result.SecurityGroup, result.TeamID, nil
}
