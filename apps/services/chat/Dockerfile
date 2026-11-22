FROM golang:1.22-alpine AS builder

WORKDIR /src

COPY go.mod ./
COPY . .

RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/chat .

FROM alpine:3.20

RUN addgroup -S app && adduser -S -G app app

WORKDIR /app
COPY --from=builder /out/chat /app/chat
COPY --from=builder /src/THIRD_PARTY_NOTICES.md /app/THIRD_PARTY_NOTICES.md
RUN mkdir -p /app/data && chown -R app:app /app/data

USER app

EXPOSE 9000

CMD ["/app/chat"]
