/*
File concentrates handlers helpers.
*/
package main

import (
	"errors"
	"io"
	"log"
	"os"

	"github.com/labstack/echo"
)

func validateForm(c echo.Context) error {
	// validating user code for now
	log.Println("code:", c.FormValue("logincode"))
	log.Println("pwd:", c.FormValue("password"))

	result := validateFormUserCODE(c.FormValue("logincode"))
	return result
}

func validateFormUserCODE(pUserCODE string) error {
	// a. check length > 0
	if len(pUserCODE) == 0 {
		return errors.New("user code is empty")
	}
	// validate form data  - b. check there are no special characters - in work
	return nil
}

// returns filename
func lowlevelUploadFile(c echo.Context, pUserID int64, pEventID int64) (string, error) {
	// read file
	file, errReadFile := c.FormFile("file")
	if errReadFile != nil {
		return file.Filename, errReadFile
	}
	fileMultipart, errOpenFile := file.Open()
	if errOpenFile != nil {
		return file.Filename, errOpenFile
	}
	defer fileMultipart.Close()

	// create file on server
	dst, errCreateFile := os.Create(uploadFolder + file.Filename)
	if errCreateFile != nil {
		return file.Filename, errCreateFile
	}
	defer dst.Close()

	// copy uploaded file to target
	_, errCopyFile := io.Copy(dst, fileMultipart)
	if errCopyFile != nil {
		return file.Filename, errCopyFile
	}
	var f File
	f.UploadedByUserID = pUserID
	f.BelongsToEventID = pEventID
	f.Name = file.Filename
	f.path = uploadFolder + file.Filename
	errRDBMS := blog.File2RDBMS(&f)
	return file.Filename, errRDBMS
}
