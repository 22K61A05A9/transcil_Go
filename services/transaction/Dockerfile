# ---------- Build Stage ----------
FROM golang:1.26.5 AS builder

WORKDIR /src

COPY shared/go.mod shared/go.sum ./shared/
COPY services/transaction/go.mod services/transaction/go.sum ./services/transaction/

WORKDIR /src/services/transaction
RUN go mod download

WORKDIR /src
COPY shared/ ./shared/
COPY services/transaction/ ./services/transaction/

WORKDIR /src/services/transaction
RUN CGO_ENABLED=0 GOOS=linux go build -o /transaction-service ./cmd

# ---------- Runtime Stage ----------
FROM debian:bookworm-slim

RUN groupadd --gid 10001 appuser \
	&& useradd --uid 10001 --gid 10001 --shell /usr/sbin/nologin --create-home appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appuser /transaction-service .
# Empty file so godotenv.Load succeeds; real config comes from compose env_file.
RUN touch .env && chown appuser:appuser .env

USER appuser

EXPOSE 9092

CMD ["./transaction-service"]
