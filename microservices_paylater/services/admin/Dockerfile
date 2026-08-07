# ---------- Build Stage ----------
FROM golang:1.26.5 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o admin-service ./cmd

# ---------- Runtime Stage ----------
FROM debian:bookworm-slim

WORKDIR /app

COPY --from=builder /app/admin-service .
COPY .env .

EXPOSE 9093

CMD ["./admin-service"]