package database

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"

	"Paylater/internal/db/sqlc"
)

var DB *sql.DB
var Queries *sqlc.Queries

func NewDB() (*sql.DB, error) {
	dsn := "gouser:Go123@tcp(localhost:3306)/paylater?parseTime=true"

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	fmt.Println("Database connected")

	return db, nil
}