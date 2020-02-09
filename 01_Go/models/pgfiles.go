package models

import (
	"bufio"
	"errors"
	"io/ioutil"
	"os"

	s "../structs"
)

// File defines File type for Pg persistance.

// Filepg type would satisfy RDBMSFile interface.
type Filepg s.File

func (*Filepg) Add(pFile *Filepg) error {
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
