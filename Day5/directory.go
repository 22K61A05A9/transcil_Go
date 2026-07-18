package main
import ("fmt"
"os")
func main(){
	//single directory creation
	//err:=os.Mkdir("Books",0755)
	//nested directory creation
	// err1:=os.MkdirAll("college/cse/students", 0755)
	// if err!=nil{
	// 	fmt.Println(err)
	// 	return 
	// }
	entries, err2 := os.ReadDir(".")
	if err2!=nil{
		fmt.Println(err2)
		return 
	}
	fmt.Println("directories",entries)
	for _, file := range entries {
		fmt.Println(file.Name())
	}
	// err1:=os.Remove("Books")
	// if err1!=nil{
	// 	fmt.Println(err1)
	// err1:=os.Remove("Books")
	// if err1!=nil{
	// 	fmt.Println(err1)
	// 	return 
	// }
	data, err := os.ReadFile("employee.txt")

	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(string(data))
	// fmt.Println("directory created")
	// fmt.Println("nested directory created")
}