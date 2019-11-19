package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"testing"
)

type JwtToken struct {
	Token string `json:"token"`
}

var tokenString string // would be pass from test to test
var apiURL = "http://localhost:" + port
var restrictedRoute = "/r/users"

func TestLogin(t *testing.T) {
	client := &http.Client{}
	formData := url.Values{"logincode": []string{"j4"}, "loginpwd": []string{"xxx"}}

	route := "/login"
	u, _ := url.ParseRequestURI(apiURL)
	u.Path = route
	apiURLFormatted := u.String()

	request, err := http.NewRequest("POST", apiURLFormatted, strings.NewReader(formData.Encode()))
	request.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Add("Content-Length", strconv.Itoa(len(formData.Encode())))
	if err != nil {
		t.Error("NewRequest constructor error: ", err)
	}

	response, err := client.Do(request)
	if err != nil {
		t.Error("NewRequest  error: ", err)
	}
	log.Println("response: ", response)

	defer response.Body.Close()
	body, err := ioutil.ReadAll(response.Body)

	var tok JwtToken
	err = json.Unmarshal(body, &tok)
	if err != nil {
		log.Println("unmarshal:", err)
	}
	tokenString = tok.Token

	if len(tokenString) == 0 {
		t.Error("No Token.")
	} else {
		log.Println("token: ", tokenString)
	}
}

func TestRestrictedRoutes(t *testing.T) {
	if len(tokenString) == 0 {
		t.Error("No Token.")
		return
	}

	client := &http.Client{}
	request, err := http.NewRequest("GET", "http://localhost:"+port+restrictedRoute, nil)

	if err != nil {
		t.Error("NewRequest constructor error: ", err)
	}

	request.Header.Set("Authorization", "Bearer "+tokenString)
	request.Header.Set("Accept", "application/json")
	log.Println("request: ", request)
	response, err := client.Do(request)

	defer response.Body.Close()
	body, err := ioutil.ReadAll(response.Body)

	log.Println("body", string(body))

}
