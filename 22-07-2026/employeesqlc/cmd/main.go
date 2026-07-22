package main
import (
"context"
"database/sql"
"fmt"
"log"
_ "github.com/go-sql-driver/mysql"
	db "employeesqlc/db/sqlc"
)
func main(){
	conn,err:=sql.Open("mysql","gouser:Go@123@tcp(localhost:3306)/company",
  	)
	if err!=nil{
		fmt.Println(err)
	}
	defer conn.Close()
	if err:=conn.Ping();err!=nil{
		fmt.Println(err)
	}
	fmt.Println("connected")
	queries:=db.New(conn)
	// ctx:=context.Background()
	// params:=[]db.CreateEmployeeParams{
	//    {
	// 		Name:"Hari",
// 			Age:22,
// 			Salary:"5000.00",
// 	   },
// 	   {
// 		Name:   "Priya",
// 		Age:    23,
// 		Salary: "60000.00",
// 	},
// 	{
// 		Name:   "Rahul",
// 		Age:    24,
// 		Salary: "70000.00",
// 	},
// 	}
// 	for _,emp:=range params{
// 	err=queries.CreateEmployee(ctx,emp)
// 	if err!=nil{
// 		fmt.Println(err)
// 	}
//   }
//   employee, err := queries.GetEmployee(
// 	context.Background(),
// 	1,
// )

// if err != nil {
// 	log.Fatal(err)
// }

// fmt.Println("Employee Details")
// fmt.Println("ID:", employee.ID)
// fmt.Println("Name:", employee.Name)
// fmt.Println("Age:", employee.Age)
// fmt.Println("Salary:", employee.Salary)
// 	fmt.Println("inserted")
	updateParams := db.UpdateEmployeeParams{
		ID:     1,
		Name:   "Hari Krishna",
		Age:    23,
		Salary: "90000.00",
	}

	err = queries.UpdateEmployee(context.Background(), updateParams)
	if err != nil {
		log.Fatal(err)
	}

	// err = queries.DeleteEmployee(context.Background(), 2)
	// if err != nil {
	// 	log.Fatal(err)
	// }
}