package database

import (
	"github.com/go-pg/pg"
)

var (
	// DBConn is the connection handle for the database. To look into further decoupling.
	DBConn *pg.DB
)

// https://stackoverflow.com/questions/31218008/sharing-a-globally-defined-db-conn-with-multiple-packages-in-golang
