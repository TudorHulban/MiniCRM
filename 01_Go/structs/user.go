package structs

// UserPg is the representation of the user of the app in the Postgres persistance layer.
// Several methods are defined on this structure in order to satisfy RDBMSUser interface.
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
