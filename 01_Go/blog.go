package main

import (
	"github.com/go-pg/pg"
	"github.com/go-pg/pg/orm"
)

// Blog concentrates resources that are permanently needed in memory.
type Blog struct {
	DBConn    *pg.DB
	Users     []User
	Teams     []Team
	Resources []Resource
}

func (b *Blog) CreateTable4Model(pModel interface{}) error {
	return b.DBConn.CreateTable(pModel, &orm.CreateTableOptions{Temp: false, IfNotExists: true, FKConstraints: true})
}

func NewBlog(pDB *pg.DB) (*Blog, error) {
	result := new(Blog)
	result.DBConn = pDB

	errSLAPriority := result.CreateTable4Model(interface{}(&SLAPriority{}))
	if errSLAPriority != nil {
		return nil, errSLAPriority
	}
	errSLA := result.CreateTable4Model(interface{}(&SLA{}))
	if errSLA != nil {
		return nil, errSLA
	}
	errSLAValues := result.CreateTable4Model(interface{}(&SLAValues{}))
	if errSLAValues != nil {
		return nil, errSLAValues
	}
	errTicketType := result.CreateTable4Model(interface{}(&TicketType{}))
	if errTicketType != nil {
		return nil, errTicketType
	}
	errTicketStatus := result.CreateTable4Model(interface{}(&TicketStatus{}))
	if errTicketStatus != nil {
		return nil, errTicketStatus
	}
	errResources := result.CreateTable4Model(interface{}(&Resource{}))
	if errResources != nil {
		return nil, errResources
	}
	errResoMovements := result.CreateTable4Model(interface{}(&ResourceMove{}))
	if errResoMovements != nil {
		return nil, errResoMovements
	}
	errContacts := result.CreateTable4Model(interface{}(&Contact{}))
	if errContacts != nil {
		return nil, errContacts
	}
	errUsers := result.CreateTable4Model(interface{}(&User{}))
	if errUsers != nil {
		return nil, errUsers
	}
	errTeams := result.CreateTable4Model(interface{}(&Team{}))
	if errTeams != nil {
		return nil, errTeams
	}
	errUploads := result.CreateTable4Model(interface{}(&File{}))
	if errUploads != nil {
		return nil, errUploads
	}
	errTickets := result.CreateTable4Model(interface{}(&Ticket{}))
	if errTickets != nil {
		return nil, errTickets
	}
	errTickets = result.CreateTable4Model(interface{}(&TicketMovement{}))
	if errTickets != nil {
		return nil, errTickets
	}
	errEvents := result.CreateTable4Model(interface{}(&Event{}))
	if errEvents != nil {
		return nil, errEvents
	}
	return result, nil
}
