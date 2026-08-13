# ---------- Build Stage ----------
FROM golang:1.26.5 AS builder

WORKDIR /src

COPY services/gateway/go.mod services/gateway/go.sum ./services/gateway/

WORKDIR /src/services/gateway
RUN go mod download

COPY services/gateway/ ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /gateway ./cmd

# ---------- Runtime Stage ----------
FROM debian:bookworm-slim

RUN groupadd --gid 10001 appuser \
	&& useradd --uid 10001 --gid 10001 --shell /usr/sbin/nologin --create-home appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appuser /gateway .
# Empty file so godotenv.Load succeeds; real config comes from compose env_file.
RUN touch .env && chown appuser:appuser .env

USER appuser

EXPOSE 9090

CMD ["./gateway"]
