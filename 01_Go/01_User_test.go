package main

import (
	"log"
	"strconv"
	"testing"
)

var userCode string
var max int64

func init() {
	var errMax error
	max, errMax = blog.GetMaxIDUsers()
	if errMax != nil {
		log.Fatal("errMax:", errMax)
	}
	log.Println(max)

	userCode = "john" + strconv.FormatInt(max+1, 10)
	log.Println("userCode:", userCode)
}

func TestUserAdd(t *testing.T) {
	userId := max + 1
	log.Println("userId:", userId)
	u := User{Id: userId, Name: "John", LoginCODE: userCode, Emails: []string{"e1@x.com"}, Group: 1}
	errAdd := blog.AddUser(&u)

	if errAdd != nil {
		t.Error("TestUserAdd:", errAdd)
	}
}

func TestGetUserByID(t *testing.T) {
	id := max + 1
	u, errGet := blog.GetUserByPK(int64(id))

	if errGet != nil {
		t.Error("TestGetUserByID:", errGet)
	}
	log.Println("user:", u)
}

func TestGetUserByCode(t *testing.T) {
	u, errGet := blog.GetUserByCode("john1")
	log.Println("u:", u)
	if errGet != nil {
		t.Error("TestGetUserByCode:", errGet)
	}
	log.Println("user by code:", u)
}
