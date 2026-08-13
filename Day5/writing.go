package main
import (
	"fmt"
	"os"
)
func main() {
	// file,_:=os.Create("employee.txt")
    // err := os.WriteFile(
	// 	"employee.txt",
	// 	[]byte("Hari Priyanka"),
	// 	0644,
	// )
	// file.Write([]byte("Hello"))
	// file.WriteString("Hi")
	// if err != nil {
	// 	fmt.Println(err)
	// 	return
	// }
	// fmt.Println("File Written Successfully")
	file, err := os.OpenFile(
		"employee.txt",
		os.O_APPEND|os.O_WRONLY|os.O_CREATE,
		0644,
	)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()
	file.WriteString("\nAge:21")
	fmt.Println("Appended Successfully")
}