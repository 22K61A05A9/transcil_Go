package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func ConnectDB() *sql.DB {

	username := "players_app"
	password := "Players@123"
	host := "172.20.224.1"
	port := "3306"
	database := "players"

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=true",
		username,
		password,
		host,
		port,
		database,
	)

	db, err := sql.Open("mysql", dsn)

	if err != nil {
		log.Fatal("Error opening database:", err)
	}

	err = db.Ping()

	if err != nil {
		log.Fatal("Error connecting to MySQL:", err)
	}

	log.Println("MySQL connected successfully")

	return db
}