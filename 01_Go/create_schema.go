package main

import (
	"log"
	"os"

	"github.com/go-pg/pg"
)

func init() {
	// create database tables and blog structure
	db = pg.Connect(&pg.Options{
		//Addr:     "127.0.0.1:5432",
		User:     "postgres",
		Password: "pp",
		Database: "postgres",
	})
	var errCreateBlog error
	blog, errCreateBlog = NewBlog(db)
	if errCreateBlog != nil {
		log.Println("errCreateBlog:", errCreateBlog)
		os.Exit(99)
	}
	// create SLAPriority
	p1 := SLAPriority{CODE: "Low"}
	p2 := SLAPriority{CODE: "Medium"}
	p3 := SLAPriority{CODE: "High"}
	blog.AddSLAPriority(&p1)
	blog.AddSLAPriority(&p2)
	blog.AddSLAPriority(&p3)

	// create SLAs
	s := SLA{CODE: "CONTRACT"}
	blog.AddSLA(&s)

	// create SLA values
	svalue1 := SLAValues{SLAID: 1, SLAPriorityID: 1, SecondsToRespond: 14400, SecondsToSolve: 28800}
	svalue2 := SLAValues{SLAID: 1, SLAPriorityID: 2, SecondsToRespond: 7200, SecondsToSolve: 14400}
	svalue3 := SLAValues{SLAID: 1, SLAPriorityID: 3, SecondsToRespond: 3600, SecondsToSolve: 7200}
	blog.AddSLAValues(&svalue1)
	blog.AddSLAValues(&svalue2)
	blog.AddSLAValues(&svalue3)

	// create sample ticket types
	ttype01 := TicketType{TypeCODE: "INCIDENT", SLAID: 1}
	addTicketType(blog, &ttype01)

	// create ticket statuses
	tstatus01 := TicketStatus{TicketTypeID: 1, StatusCODE: "JUSTOPENED", StatusDescription: "immediately after ticket opened"}
	addTypeTickStatus(blog, &tstatus01)
	tstatus02 := TicketStatus{TicketTypeID: 1, StatusCODE: "INWORK", StatusDescription: "in work"}
	addTypeTickStatus(blog, &tstatus02)
	tstatus03 := TicketStatus{TicketTypeID: 1, StatusCODE: "MOREDATA", StatusDescription: "more data needed"}
	addTypeTickStatus(blog, &tstatus03)
	tstatus04 := TicketStatus{TicketTypeID: 1, StatusCODE: "INTERNOTE", StatusDescription: "internal note"}
	addTypeTickStatus(blog, &tstatus04)
	tstatus05 := TicketStatus{TicketTypeID: 1, StatusCODE: "SOLVED", StatusDescription: "solved"}
	addTypeTickStatus(blog, &tstatus05)
	tstatus06 := TicketStatus{TicketTypeID: 1, StatusCODE: "VERIFY", StatusDescription: "solution is verified"}
	addTypeTickStatus(blog, &tstatus06)
	tstatus07 := TicketStatus{TicketTypeID: 1, StatusCODE: "DEPLOY", StatusDescription: "solution is deployed"}
	addTypeTickStatus(blog, &tstatus07)
	tstatus08 := TicketStatus{TicketTypeID: 1, StatusCODE: "CLOSED", StatusDescription: "closed"}
	addTypeTickStatus(blog, &tstatus08)

	// create sample users
	userRights = map[int]string{1: "admin", 2: "user", 3: "external user"}
	log.Println(userRights)
	c1 := Contact{FirstName: "Admin", LastName: "Account"}
	c2 := Contact{FirstName: "Mary", LastName: "Smith"}
	c3 := Contact{FirstName: "Lee", LastName: "Cooper"}
	u1 := User{LoginCODE: "admin", loginPWD: "xxx", SecurityGroup: 1, TeamID: 1, ContactInfo: []*Contact{&c1, &c2}}
	blog.NewUser(&u1)
	u2 := User{LoginCODE: "j2", loginPWD: "xxx", SecurityGroup: 2, TeamID: 2, ContactInfo: []*Contact{&c3}}
	blog.NewUser(&u2)

	// create sample teams
	team1 := Team{CODE: "ADMINS", Name: "Team ADMINS", Description: "Team concentrating admins", ManagerID: 1}
	blog.AddTeam(&team1)
	team2 := Team{CODE: "USERS", Name: "Team Users", Description: "Team concentrating users", ManagerID: 2}
	blog.AddTeam(&team2)

	// create sample tickets
	t1 := Ticket{TypeCODE: 1, Title: "Ticket 1", Description: "Description for ticket 1", OpenedByUserID: 1}
	t2 := Ticket{TypeCODE: 1, Title: "Ticket 2", Description: "Description for ticket 2", OpenedByUserID: 2}
	log.Println("AddTicket:", blog.AddTicket(&t1))
	log.Println("AddTicket:", blog.AddTicket(&t2))

	// create sample resources
	resourceTypes = map[int]string{1: "laptop", 2: "car"}
	r1 := Resource{Type: 1, Description: "Laptop DELL"}
	blog.AddResource(&r1)

	// create sample events
	e1 := Event{TicketID: 1, OpenedByUserID: 1, Title: "Ticket 1 Event 1 Title", Contents: "this is content for ticket 1, event 1"}
	blog.AddEvent(&e1)
	e2 := Event{TicketID: 2, OpenedByUserID: 1, Title: "Ticket 2 Event 1 Title", Contents: "this is content for ticket 2, event 1"}
	blog.AddEvent(&e2)
	e3 := Event{TicketID: 2, OpenedByUserID: 2, Title: "Ticket 2 Event 2 Title", Contents: "this is content for ticket 2, event 2"}
	blog.AddEvent(&e3)
}
