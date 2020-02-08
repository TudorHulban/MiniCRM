package interf

type RDBMSUser interface {
	Add(pUser *User) error
	GetUserByPK(pID int64) (User, error)
	GetUserByCodeUnauthorized(pCODE string) (User, error)
	GetUserByCode(pRequesterUserID int64, pCODE string) (User, error)
	GetAllUsers(pRequesterUserID int64, pHowMany int) ([]User, error)
	GetMaxIDUsers() (int64, error)
	UpdateUser(pUser *User) error
}
