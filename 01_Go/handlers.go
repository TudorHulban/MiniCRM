/*
File concentrates handlers for exposed endpoints.
HTTP status codes as per:
https://www.restapitutorial.com/httpstatuscodes.html
*/
package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/labstack/echo"
)

type httpError struct {
	TheError string `json:"error"`
}

// hLoginWithUserPassword is handler to perform user and password authentication against persisted data.
func hLoginWithUserPassword(c echo.Context) error {
	var e httpError
	e.TheError = "credentials not found"

	errValidateForm := validateForm(c)
	if errValidateForm != nil {
		e.TheError = "credentials could not be parsed"
		return c.JSON(http.StatusBadRequest, e)
	}
	// error is user info not found, we are not hiding this with 404
	u, errGetUser := blog.GetUserByCodeUnauthorized(c.FormValue("logincode"))
	log.Println("fetched:", u)
	if errGetUser != nil {
		return c.JSON(http.StatusForbidden, e)
	}
	// at this stage user info is found, to check password. error is password does not match not found, we are not hiding this with 404
	log.Println("Form user:", c.FormValue("logincode"), "Form pwd:", c.FormValue("password"), "PasswordSALT:", u.PasswordSALT)
	if !checkPasswordHash(c.FormValue("password"), u.PasswordSALT, u.PasswordHASH) {
		return c.JSON(http.StatusForbidden, e)
	}
	t, errJWT := createJWT()
	if errJWT != nil {
		return c.String(http.StatusInternalServerError, errJWT.Error())
	}
	log.Println(echo.Map{"token": t})
	return c.JSON(http.StatusOK, echo.Map{"token": t, "id": u.ID})
}

func hValidCode(c echo.Context) error {
	formCODE := c.Param("code")
	log.Println("code:", formCODE)
	u, errGetUser := blog.GetUserByCodeUnauthorized(formCODE)
	if errGetUser == nil {
		if len(u.LoginCODE) > 0 {
			return c.String(http.StatusSeeOther, "code exists")
		}
	}
	return c.String(http.StatusOK, "OK")
}

// CREATE Endpoints -------------------

func hNewUser(c echo.Context) error {
	var e httpError

	if (len(c.FormValue("name")) == 0) || (len(c.FormValue("logincode")) == 0) || (len(c.FormValue("loginpwd")) == 0) {
		e.TheError = "input information is not valid"
		return c.JSON(http.StatusNotAcceptable, e)
	}
	var u User
	var co Contact
	co.FirstName = c.FormValue("name")
	co.CompanyEmail = c.FormValue("email")

	u.LoginCODE = c.FormValue("logincode")
	u.loginPWD = c.FormValue("loginpwd")
	u.SecurityGroup = 1
	u.ContactInfo = append(u.ContactInfo, &co)
	errAdd := blog.NewUser(&u)
	if errAdd != nil {
		e.TheError = errAdd.Error()
		return c.JSON(http.StatusInternalServerError, e)
	}
	return c.JSON(http.StatusOK, u)
}

func hNewTicket(c echo.Context) error {
	var e httpError

	if (len(c.FormValue("code")) == 0) || (len(c.FormValue("title")) == 0) {
		return c.JSON(http.StatusNotAcceptable, "input information is not valid")
	}
	userCODE := c.FormValue("code")

	// read from token user id
	var tokenUserID int64
	tokenUserID = 1

	u, errGet := blog.GetUserByCode(tokenUserID, userCODE)
	if errGet != nil {
		e.TheError = "user code " + userCODE + " not found."
		return c.JSON(http.StatusNotFound, e)
	}
	var ev Event
	ev.OpenedByUserID = u.ID
	ev.Contents = c.FormValue("content")
	ev.Title = c.FormValue("title")

	errAdd := blog.AddEvent(&ev)
	if errAdd != nil {
		e.TheError = errAdd.Error()
		return c.JSON(http.StatusInternalServerError, e)
	}
	fname, errUpload := lowlevelUploadFile(c, u.ID, ev.ID)
	if errUpload != nil {
		e.TheError = "could not upload file: " + errUpload.Error()
		return c.JSON(http.StatusInternalServerError, e)
	}
	e.TheError = "OK" + " - " + fname
	return c.JSON(http.StatusOK, e)
}

// hNewEvent does not affiliate to other event. no need for event ID.
func hNewEvent(c echo.Context) error {
	var e httpError

	if (len(c.FormValue("code")) == 0) || (len(c.FormValue("title")) == 0) {
		return c.JSON(http.StatusNotAcceptable, "input information is not valid")
	}
	userCODE := c.FormValue("code")

	// read from token user id
	var tokenUserID int64
	tokenUserID = 1

	u, errGet := blog.GetUserByCode(tokenUserID, userCODE)
	if errGet != nil {
		e.TheError = "user code " + userCODE + " not found."
		return c.JSON(http.StatusNotFound, e)
	}
	var ev Event
	ev.OpenedByUserID = u.ID
	ev.Contents = c.FormValue("content")
	ev.Title = c.FormValue("title")

	errAdd := blog.AddEvent(&ev)
	if errAdd != nil {
		e.TheError = errAdd.Error()
		return c.JSON(http.StatusInternalServerError, e)
	}
	fname, errUpload := lowlevelUploadFile(c, u.ID, ev.ID)
	if errUpload != nil {
		e.TheError = "could not upload file: " + errUpload.Error()
		return c.JSON(http.StatusInternalServerError, e)
	}
	e.TheError = "OK" + " - " + fname
	return c.JSON(http.StatusOK, e)
}

// hUploadFile is to be used to load files on existing events.
func hNewFile(c echo.Context) error {
	var e httpError

	eventID, errParse := strconv.ParseInt(c.FormValue("eventid"), 10, 64)
	if errParse != nil {
		e.TheError = "could not parse event ID"
		return c.JSON(http.StatusNotAcceptable, e)
	}
	ev, errGet := blog.GetEventbyPK(eventID)
	if errGet != nil {
		e.TheError = "could not get event ID"
		return c.JSON(http.StatusNotAcceptable, e)
	}

	userCODE := c.FormValue("code")
	// read from token user id
	var tokenUserID int64
	tokenUserID = 1

	user, errGetUser := blog.GetUserByCode(tokenUserID, userCODE)
	if errGetUser != nil {
		return c.String(http.StatusInternalServerError, "Could not errGetUser: "+errGetUser.Error())
	}

	fname, errUpload := lowlevelUploadFile(c, user.ID, ev.ID)
	if errUpload != nil {
		return c.String(http.StatusInternalServerError, "Could not upload file: "+errUpload.Error())
	}
	return c.HTML(http.StatusOK, fmt.Sprintf("<p>File %s uploaded successfully by user with code %s.</p>", fname, userCODE))
}

// READ Endpoints -------------------

func hGetLatestEvents(c echo.Context) error {
	var e httpError

	howMany, errParse := strconv.Atoi(c.Param("no"))
	if errParse != nil {
		e.TheError = "bad how many " + c.Param("no")
		return c.JSON(http.StatusBadRequest, e)
	}
	result, errGet := blog.GetLatestEvents(2, howMany)
	if errGet != nil {
		e.TheError = "error:" + errGet.Error()
		return c.JSON(http.StatusNotFound, e)
	}
	return c.JSON(http.StatusOK, result)
}

func hGetEvents4Ticket(c echo.Context) error {
	var e httpError

	ticketID, errParse := strconv.ParseInt(c.Param("id"), 10, 64)
	if errParse != nil {
		e.TheError = "bad ticket ID " + c.Param("id")
		return c.JSON(http.StatusBadRequest, e)
	}
	howMany, errParse := strconv.Atoi(c.Param("no"))
	if errParse != nil {
		e.TheError = "bad how many " + c.Param("no")
		return c.JSON(http.StatusBadRequest, e)
	}
	result, errGet := blog.GetEventsByTicketID(ticketID, howMany)
	if errGet != nil {
		e.TheError = "error:" + errGet.Error()
		return c.JSON(http.StatusNotFound, e)
	}
	return c.JSON(http.StatusOK, result)
}

func hGetLastTickets(c echo.Context) error {
	var e httpError

	limit, errParse := strconv.ParseInt(c.Param("no"), 10, 64)
	if errParse != nil {
		e.TheError = "bad limit " + c.Param("id")
		return c.JSON(http.StatusBadRequest, e)
	}
	result, errGet := blog.GetLastTickets(int(limit))
	if errGet != nil {
		e.TheError = "error:" + errGet.Error()
		return c.JSON(http.StatusNotFound, e)
	}
	return c.JSON(http.StatusOK, result)
}

func hGetEvent(c echo.Context) error {
	var e httpError

	eventID, errParse := strconv.ParseInt(c.Param("id"), 10, 64)
	if errParse != nil {
		e.TheError = "bad ID " + c.Param("id")
		return c.JSON(http.StatusBadRequest, e)
	}
	ev, errGet := blog.GetEventbyPK(eventID)
	if errGet != nil {
		e.TheError = "event ID " + c.Param("id") + " not found"
		return c.JSON(http.StatusNotFound, e)
	}
	return c.JSON(http.StatusOK, ev)
}

func hGetUserEvents(c echo.Context) error {
	userID, errParse := strconv.ParseInt(c.Param("id"), 10, 64)
	if errParse != nil {
		return c.String(http.StatusBadRequest, "Bad user ID "+c.Param("id"))
	}
	_, errGet := blog.GetUserByPK(userID)
	if errGet != nil {
		return c.String(http.StatusNotFound, "User ID "+c.Param("id")+" not found.")
	}
	howManyEvents, errParse := strconv.Atoi(c.Param("no"))
	if errParse != nil {
		return c.String(http.StatusBadRequest, "Bad number of posts "+c.Param("no"))
	}
	events, errGetPosts := blog.GetEventsByUserID(userID, int(howManyEvents))
	if errGetPosts != nil {
		return c.String(http.StatusInternalServerError, errGetPosts.Error())
	}
	var result string
	for _, v := range events {
		result = result + "," + v.Title
	}
	return c.String(http.StatusOK, result[1:])
}

// hGetUsers returns users according to security rights.
func hGetUsers(c echo.Context) error {
	var e httpError
	// read from token user id
	var tokenUserID int64
	tokenUserID = 2

	users, errGetUsers := blog.GetAllUsers(tokenUserID, 50)
	if errGetUsers != nil {
		e.TheError = errGetUsers.Error()
		return c.JSON(http.StatusInternalServerError, e)
	}
	return c.JSON(http.StatusOK, users)
}

// hGetUserByPK returns JSON with user info based on requested ID.
func hGetUserByPK(c echo.Context) error {
	var e httpError

	// log.Println("Header:", c.Request().Header.Get("Authorization"))

	userID, errParse := strconv.ParseInt(c.Param("pk"), 10, 64)
	if errParse != nil {
		e.TheError = "bad ID " + c.Param("pk")
		return c.JSON(http.StatusBadRequest, e)
	}
	user, errGet := blog.GetUserByPK(userID)
	if errGet != nil {
		e.TheError = "user ID " + c.Param("pk") + " not found"
		return c.JSON(http.StatusNotFound, e)
	}
	return c.JSON(http.StatusOK, user)
}

func hGetUserCODE(c echo.Context) error {
	userCODE := c.Param("code")
	if len(userCODE) == 0 {
		return c.String(http.StatusBadRequest, "Bad user code "+c.Param("code"))
	}
	// read from token user id
	var tokenUserID int64
	tokenUserID = 2

	user, errGet := blog.GetUserByCode(tokenUserID, userCODE)
	if errGet != nil {
		return c.String(http.StatusNotFound, "User code "+userCODE+" not found.")
	}
	return c.JSON(http.StatusOK, user)
}

// UPDATE Endpoints -------------------
