package models

import (
	"bufio"
	"errors"
	"io/ioutil"
	"os"
)

// File is a type used for uploading files for events.
type File struct {
	ID               int64
	BelongsToEventID int64
	UploadedByUserID int64
	path             string // pick up path, just for testing
	Content          string // comes from []byte as base64 string
	Name             string
}

func (b *Blog) File2RDBMS(pFile *File) error {
	exists := func(pFilePath string) bool {
		if _, err := os.Stat(pFilePath); err != nil {
			if os.IsNotExist(err) {
				return false
			}
		}
		return true
	}

	if exists(pFile.path) {
		f, _ := os.Open(pFile.path)
		content, _ := ioutil.ReadAll(bufio.NewReader(f))

		pFile.Content = encode64Bytes(content)
		return b.DBConn.Insert(pFile)
	}
	return errors.New("file does not exist")
}

func (b *Blog) Stream2RDBMS(pFile *File) error {
	return b.DBConn.Insert(pFile)
}

func (b *Blog) GetMaxIDFiles() (int64, error) {
	var maxID struct {
		Max int64
	}
	_, errQuery := b.DBConn.QueryOne(&maxID, "select max(id) from files")
	return maxID.Max, errQuery
}
