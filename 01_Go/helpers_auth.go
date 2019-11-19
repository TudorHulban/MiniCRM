package main

import (
	"encoding/base64"
	"math/rand"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

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

func checkPasswordHash(pPassword, pSalt, pHash string) bool {
	errCompare := bcrypt.CompareHashAndPassword([]byte(pHash), []byte(pPassword+pSalt))
	return errCompare == nil
}

func createJWT() (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)
	claims["name"] = "Jon Snow"
	claims["admin"] = true
	claims["exp"] = time.Now().Add(time.Second * 3600).Unix()

	return token.SignedString([]byte("secret"))
}

func encode64Bytes(pContent []byte) string {
	return base64.StdEncoding.EncodeToString(pContent)
}
