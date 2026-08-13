package main

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

func main() {

	// username:password@tcp(host:port)/database
	dsn := "gouser:Go@123@tcp(172.20.224.1:3306)/company"

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		panic(err)
	}

	defer db.Close()

	err = db.Ping()
	if err != nil {
		panic(err)
	}
    //query:="Insert into emp(name, age, salary) values(?,?,?)"
	// _,err=db.Exec(query,"Hari",21,50000)
	//var n int
	// fmt.Println("enter how many rows to be inserted")
	// fmt.Scan(&n)
	// for i:=1;i<=n;i++{
	// 	var name string
	// 	var age int
	// 	var salary int
	// 	fmt.Print("enter name ")
	//     fmt.Scan(&name)
	// 	fmt.Print("age")
	// 	fmt.Scan(&age)
	// 	fmt.Printf("enter salary ")
	// 	fmt.Scan(&salary)
	// 	_,err=db.Exec(query,name,age,salary)
	//     if err!=nil{
	// 	panic(err)
	//   }
    // }
	// fmt.Println("✅ inserted to MySQL Successfully!")
	query:="select * from emp"
	r,err1:=db.Query(query)
	if err1!=nil{
		fmt.Println(err1)
	}
	defer r.Close()
	for r.Next(){
	var id int
    var name string
    var age int
    var salary float64

    err := r.Scan(&id, &name, &age, &salary)
    if err != nil {
        panic(err)
    }
    fmt.Printf("ID: %d, Name: %s, Age: %d, Salary: %.2f\n", id, name, age, salary)
	}
	
}