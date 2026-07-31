package database

import (
	"database/sql"
	"fmt"
	"os"

	"Paylater/internal/db/sqlc"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB
var Queries *sqlc.Queries

func NewDB() (*sql.DB, error) {

	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=true",
		user,
		password,
		host,
		port,
		dbName,
	)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	fmt.Println("Database Connected Successfully")

	return db, nil
}