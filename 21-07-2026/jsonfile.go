package main
import ("fmt"
"encoding/json"
"os"
// "sort"
)
type Employee struct{
	Id int `json:"id"`
	Name string `json:"name"`
	Age int `json:"age"`
	Department string `json:"department"`
	Salary int `json:"salary"`
}
func main(){
	//Read JSON File
	data,err:=os.ReadFile("employee.json")
	if err!=nil{
		fmt.Println(err)
		return
	}
	//unmarshal --json->struct
	var employees []Employee
	json.Unmarshal(data,&employees)
	// fmt.Println(employees)
	// for _,emp:=range employees{
	// 	fmt.Println(emp)
	// }
	// find employee by id
	//for _,emp:=range employees{
		// if emp.Id==2{
		// 	fmt.Println(emp)
		// 	break
		// }
		  // employee by name
		//   name:="Hari"
		// if emp.Name==name{
		// 	fmt.Println(emp)
		// }
		//filter
		// var result []Employee
	    // dept:="CSE"
		// if emp.Department==dept{
		// 	// fmt.Println(emp)
		//     result=append(result,emp)
		// 	fmt.Println(result)
		// }
	// 	if emp.Salary>45000{
	// 		fmt.Println(emp.Name)
	// 	}
	// }
	//update
	for i:=range employees{
		if employees[i].Id==2{
			employees[i].Salary=60000
			fmt.Println(employees[i])
		}
	}
	//add new employee
	newemp:=Employee{
		Id:4,
		Name:"raj",
		Age:23,
		Department:"IT",
		Salary:45000,
	}
	employees=append(employees,newemp)
	fmt.Println(employees)
	// delete emp
	// var update []Employee
	// for i:=range employees{
	// 	if employees[i].Id!=2{
	// 		update=append(update,employees[i])
	// 	}
	// }
	// fmt.Println(update)
	//ascending order
	// sort.Slice(employees,func(i,j int) bool{
	// 	return employees[i].Salary<employees[j].Salary
	// })
	// fmt.Println(employees)
	// fmt.Println(len(employees))
// 	highest := employees[0]
//     for _, emp := range employees {
// 	if emp.Salary > highest.Salary {
// 		highest = emp
// 	}
// }
//  fmt.Println(highest.Name)
jsonData, err2 := json.MarshalIndent(
	employees,
	"",
	"  ",
)
if err2!=nil{
	fmt.Println(err)
	return
}
fmt.Println(string(jsonData))
err1:=os.WriteFile("employee.json",jsonData,0644,)
if err1!=nil{
	fmt.Println(err1)
	return
}
}