FROM golang:1.7-alpine as gobuild
COPY . /go/src/github.com/ndslabs/apiserver

RUN apk --update upgrade && apk add bash build-base git gcc  && rm -rf /var/cache/apk/* && \
    go get github.com/Masterminds/glide  &&  \
    cd /go/src/github.com/ndslabs/apiserver && ./build.sh docker

FROM alpine
COPY --from=gobuild /go/src/github.com/ndslabs/apiserver/build/bin/ndslabsctl-linux-amd64 /usr/local/bin/ndslabsctl
COPY --from=gobuild /go/src/github.com/ndslabs/apiserver/build/bin/apiserver-linux-amd64 /usr/local/bin/apiserver
COPY entrypoint.sh /entrypoint.sh
COPY templates /templates
RUN apk --update upgrade && apk add bash git vim && rm -rf /var/cache/apk/*

ENTRYPOINT ["/entrypoint.sh"]
CMD ["apiserver"]
