# ---------- Build Stage ----------
FROM golang:1.26.5 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o gateway ./cmd

# ---------- Runtime Stage ----------
FROM debian:bookworm-slim

WORKDIR /app

COPY --from=builder /app/gateway .
COPY .env .

EXPOSE 9090

CMD ["./gateway"]