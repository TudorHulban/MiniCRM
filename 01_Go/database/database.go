package database

import (
	"github.com/go-pg/pg"
)

var (
	// DBConn is the connection handle for the database.
	DBConn *pg.DB
)
