# ---------- Build Stage ----------
FROM golang:1.26.5 AS builder

WORKDIR /src

COPY shared/go.mod shared/go.sum ./shared/
COPY services/user/go.mod services/user/go.sum ./services/user/

WORKDIR /src/services/user
RUN go mod download

WORKDIR /src
COPY shared/ ./shared/
COPY services/user/ ./services/user/

WORKDIR /src/services/user
RUN CGO_ENABLED=0 GOOS=linux go build -o /user-service ./cmd

# ---------- Runtime Stage ----------
FROM debian:bookworm-slim

RUN groupadd --gid 10001 appuser \
	&& useradd --uid 10001 --gid 10001 --shell /usr/sbin/nologin --create-home appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appuser /user-service .
# Empty file so godotenv.Load succeeds; real config comes from compose env_file.
RUN touch .env && chown appuser:appuser .env

USER appuser

EXPOSE 9091

CMD ["./user-service"]
