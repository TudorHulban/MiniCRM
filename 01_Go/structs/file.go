package structs

// File is a type used for uploading files for events. The files are uploaded and persisted to RDBMS.
type File struct {
	ID               int64
	BelongsToEventID int64
	UploadedByUserID int64
	path             string // pick up path, just for testing
	Content          string // comes from []byte as base64 string
	Name             string
}
