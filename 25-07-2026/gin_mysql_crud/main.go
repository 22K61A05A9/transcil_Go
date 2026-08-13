package main

import (
	"log"

	"gin_mysql_crud/config"
	"gin_mysql_crud/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatal("could not connect database")
	}
	defer db.Close()
	router := gin.Default()
	routes.RegisterRoutes(router, db)

	router.Run(":8060")
}
