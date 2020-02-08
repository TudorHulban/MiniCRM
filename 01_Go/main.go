package main

import (
	"github.com/go-pg/pg"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

const port = "1323"
const uploadFolder = "public/uploads/"

var blog *Blog
var db *pg.DB

func main() {
	defer db.Close()

	e := echo.New()
	e.HideBanner = true
	e.Use(middleware.Logger())

	// enable CORS
	/*
	   Preflight request
	   Before the AJAX request is made the browser will perform a preflight request. This is an OPTIONS request that the browser will use to check the policy.
	   So when implementing the CORS policy on the server also send the policy for OPTIONS requests.
	*/
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{"*"},
	}))

	// public routes
	e.Static("/", "assets")
	e.POST("/login", hLoginWithUserPassword)

	// private routes
	r := e.Group("/r")

	// configure middleware with JWT (no claims)
	midConfig := middleware.JWTConfig{SigningKey: []byte("secret")}
	r.Use(middleware.JWTWithConfig(midConfig))

	// user related
	e.HEAD("/validcode/:code", hValidCode)
	e.POST("/create", hNewUser)
	e.GET("/users", hGetUsers)

	// for token testing
	// curl localhost:1323/r/userid/1 -H "Authorization: Bearer <JWT token>"
	r.GET("/userid/:pk", hGetUserByPK)

	e.GET("/usercode/:code", hGetUserCODE)
	r.GET("/userevents/:id/posts/:no", hGetUserEvents)

	// ticket related
	e.POST("/newticket", hNewTicket)
	e.GET("/tickets/:no", hGetLastTickets)

	// event related
	e.POST("/uploadfile", hNewFile)
	e.POST("/newevent", hNewEvent)
	e.GET("/event/:id", hGetEvent)
	e.GET("/evticket/:id/:no", hGetEvents4Ticket)
	e.GET("evlatest/:no", hGetLatestEvents)
	e.Logger.Fatal(e.Start(":" + port))
}
