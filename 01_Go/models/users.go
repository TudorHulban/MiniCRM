package models

import (
	"math/rand"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

/*
Uses docker image created:
docker run --name P1 -d -p 5432:5432 -e POSTGRES_PASSWORD=pp postgres:alpine

Needs cache for users. Not to go to db for user ID.
*/

const saltLength = 8

var userRights map[int]string

// User is the representation of the user of the app in the persistance layer.
// Several methods are defined on this structure in order to provide the functionality needed.
// Sorted for maligned.
type User struct {
	TeamID        int    // security groups 2, 3 can only see teams tickets
	SecurityGroup int    `pg:",notnull"` // as per userRights, userRights = map[int]string{1: "admin", 2: "user", 3: "external user"}
	TicketsNo     int    // number of assigned tickets
	ID            int64  `json:"ID"`             // primary key, provided after insert thus pointer needed.
	PasswordSALT  string `json:"-" pg:",notnull` // should not be sent in JSON, exported for ORM
	PasswordHASH  string `json:"-" pg:",notnull` // should not be sent in JSON, exported for ORM
	LoginCODE     string `json:"code" pg:",notnull,unique"`
	loginPWD      string `pg:",notnull"`

	ContactIDs  []int64    // user should accomodate several contacts
	ContactInfo []*Contact `pg:"-"`
}

type RDBMSUser interface {
}

func generateSalt(pLength int) string {
	rand.Seed(time.Now().UnixNano())
	result := make([]string, pLength)

	randInt := func(pMin, pMax int) int {
		return pMin + rand.Intn(pMax-pMin)
	}
	for k := range result {
		result[k] = string(byte(randInt(65, 90)))
	}
	return strings.Join(result, "")
}

func hashPassword(pPassword, pSalt string) (string, error) {
	bytes, errHash := bcrypt.GenerateFromPassword([]byte(pPassword+pSalt), 14)
	return string(bytes), errHash
}

// PersistUser saves the user variable in the persistance layer. Pointer needed as ID would be read from RDBMS insert.
func PersistUser(pUser *User) error {
	pUser.PasswordSALT = generateSalt(saltLength)
	hash, errHash := hashPassword(pUser.loginPWD, pUser.PasswordSALT)
	if errHash != nil {
		return errHash
	}
	pUser.PasswordHASH = hash

	for _, v := range pUser.ContactInfo {
		errInsertContact := b.DBConn.Insert(v)
		if errInsertContact != nil {
			return errInsertContact
		}
		pUser.ContactIDs = append(pUser.ContactIDs, v.ID)
	}
	errInsertUser := b.DBConn.Insert(pUser)
	if errInsertUser != nil {
		return errInsertUser
	}

	for _, v := range pUser.ContactInfo {
		v.UserID = pUser.ID
		errUpdateContact := b.DBConn.Update(v)
		if errUpdateContact != nil {
			return errUpdateContact
		}
	}
	return nil
}

// CRUD - Read

func (b *Blog) GetUserByPK(pID int64) (User, error) {
	result := User{ID: pID}
	requester, errSelectRequester := getRequesterSecurityGroup(b, 1)
	if errSelectRequester != nil {
		return result, errSelectRequester
	}
	var errSelect error
	switch requester.SecurityGroup {
	case 1:
		{
			errSelect = b.DBConn.Select(&result)
		}
	case 2:
		{
			errSelect = b.DBConn.Model(&result).Where("team_id = ?", requester.TeamID).Where("id = ?", pID).Select()
		}
	}
	if errSelect != nil {
		return result, errSelect
	}
	return result, getContactInfo(b, &result)
}

// GetUserByCode retrieves user given code.
func (b *Blog) GetUserByCode(pRequesterUserID int64, pCODE string) (User, error) {
	result := User{LoginCODE: pCODE}
	requester, errSelectRequester := getRequesterSecurityGroup(b, 1)
	if errSelectRequester != nil {
		return result, errSelectRequester
	}
	var errSelect error
	switch requester.SecurityGroup {
	case 1:
		{
			errSelect = b.DBConn.Model(&result).Where("login_code = ?", pCODE).Select()
		}
	default:
		{
			errSelect = b.DBConn.Model(&result).Where("team_id = ?", requester.TeamID).Where("login_code = ?", pCODE).Select()
		}
	}
	if errSelect != nil {
		return result, errSelect
	}
	return result, getContactInfo(b, &result)
}

// GetUserByCodeUnauthorized retrieves user given code.
func (b *Blog) GetUserByCodeUnauthorized(pCODE string) (User, error) {
	result := User{LoginCODE: pCODE}
	errSelect := b.DBConn.Model(&result).Where("login_code = ?", pCODE).Select()

	if errSelect != nil {
		return result, errSelect
	}
	return result, getContactInfo(b, &result)
}

// GetAllUsers retrieves user as per requester security rights.
func (b *Blog) GetAllUsers(pRequesterUserID int64, pHowMany int) ([]User, error) {
	var result []User
	requester, errSelectRequester := getRequesterSecurityGroup(b, 1)
	if errSelectRequester != nil {
		return result, errSelectRequester
	}
	var errSelect error
	switch requester.SecurityGroup {
	case 1:
		{
			errSelect = b.DBConn.Model(&result).Order("id DESC").Limit(pHowMany).Select()
		}
	case 2:
		{
			errSelect = b.DBConn.Model(&result).Where("team_id = ?", requester.TeamID).Limit(pHowMany).Select()
		}
	}
	return result, errSelect
}

func (b *Blog) GetMaxIDUsers() (int64, error) {
	var maxID struct {
		Max int64
	}
	_, errQuery := b.DBConn.QueryOne(&maxID, "select max(id) from users")
	return maxID.Max, errQuery
}

// CRUD - Update

func (b *Blog) UpdateUser(pUser *User) error {
	return b.DBConn.Update(pUser)
}

// CRUD - Delete

// Helpers

func getRequesterSecurityGroup(b *Blog, pRequesterUserID int64) (*User, error) {
	result := new(User)
	result.ID = pRequesterUserID
	return result, b.DBConn.Select(result)
}

func getContactInfo(b *Blog, pUser *User) error {
	for _, v := range pUser.ContactIDs {
		co := new(Contact)
		co.ID = v
		errSelectContact := b.DBConn.Select(co)
		if errSelectContact != nil {
			return errSelectContact
		}
		pUser.ContactInfo = append(pUser.ContactInfo, co)
	}
	return nil
}
