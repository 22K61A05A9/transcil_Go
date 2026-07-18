package main
import ("fmt"
"os")
func main(){
	//creating files
	// file,err1:=os.Create("employee.txt")
	// file1,err1:=os.Create("company.txt")
	// open a file
	// file,err:=os.Open("employee.txt")
	// if err!=nil{
	// 	fmt.Println("error",err)
	// 	return 
	// }
	//delete a file
	// err1:=os.Remove("company.txt")
	// if err1!=nil{
	// 	fmt.Println("error",err1)
	// 	return 
	// }
	//rename a file
	// os.Rename("student.txt", "employee.txt")
	// defer file.Close()
	// defer file1.Close()
	// fmt.Println("student",*file)
	// fmt.Println("deleted")
	
	// _, err := os.Stat("employee.txt")
	// if err == nil {
	// 	fmt.Println("File Exists")
	// } else {
	// 	fmt.Println("File Not Found")
	// }
	// defer file.Close()
	// file.WriteString("Hello world")
	// file.WriteString("welcome to GOlang")
	// fmt.Println(file)
	data, err2 := os.ReadFile("employee.txt")

	if err2 != nil {
		fmt.Println(err2)
		return
	}

	 fmt.Println(string(data))
	
}