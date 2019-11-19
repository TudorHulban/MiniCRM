# docker file for go app. needs postgres db in order to run
# not tested. do not use as is.
FROM golang:1.13.1-alpine3.10
RUN apk add git
RUN git --version

WORKDIR $GOPATH/src
RUN git clone https://github.com/TudorHulban/Svelte2019.git

WORKDIR $GOPATH/src/Svelte2019/01_CRM
RUN go get -v
RUN go build -o ./go_app main.go ops_posts.go ops_users.go commons.go   
# RUN ls -la 

CMD ["./go_app"]
# https://hub.docker.com/r/tudi/tsvelte
