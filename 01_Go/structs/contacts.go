package structs

type Contact struct {
	ID             int64
	UserID         int64  `pg:"userid"`
	FirstName      string `json:"firstname"`
	LastName       string `json:"lasttname"`
	OfficePhoneNo  string
	MobilePhoneNo  string
	CompanyEmail   string
	WorkEmail      string
	AddressHQ      string
	AddressOffice  string
	AddressBilling string
}
