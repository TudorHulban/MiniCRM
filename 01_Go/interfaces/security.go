// Package interfaces provides decoupling interfaces.
package interfaces

type RDBMSSecurity interface {
	// getUserSecurityGroup receives the ID of the user requesting the info and returns the security group ID and Team ID of the user.
	GetSecurity(pID int64) (int64, int64, error)
}
