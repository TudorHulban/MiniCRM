package models

func AddTeam(pTeam *Team) error {
	return b.DBConn.Insert(pTeam)
}
