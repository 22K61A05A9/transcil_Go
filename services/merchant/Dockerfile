# ---------- Build Stage ----------
FROM golang:1.26.5 AS builder

WORKDIR /src

COPY shared/go.mod shared/go.sum ./shared/
COPY services/merchant/go.mod services/merchant/go.sum ./services/merchant/

WORKDIR /src/services/merchant
RUN go mod download

WORKDIR /src
COPY shared/ ./shared/
COPY services/merchant/ ./services/merchant/

WORKDIR /src/services/merchant
RUN CGO_ENABLED=0 GOOS=linux go build -o /merchant-service ./cmd

# ---------- Runtime Stage ----------
FROM debian:bookworm-slim

RUN groupadd --gid 10001 appuser \
	&& useradd --uid 10001 --gid 10001 --shell /usr/sbin/nologin --create-home appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appuser /merchant-service .
# Empty file so godotenv.Load succeeds; real config comes from compose env_file.
RUN touch .env && chown appuser:appuser .env

USER appuser

EXPOSE 9094

CMD ["./merchant-service"]
