package config

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)
func ConnectDB() (*sql.DB,error){
   db,err:=sql.Open("mysql",
   "gouser:Go@123@tcp(localhost:3306)/company",
   )
   if err!=nil{
	return nil,err
   }	
   err=db.Ping()
   if err!=nil{
	return nil,err
   }
   fmt.Println("Connected to DB")
   return db,nil
}