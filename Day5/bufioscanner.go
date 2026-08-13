package main
import ("fmt"
"os"
"bufio")
func main(){
	file,err:=os.Open("employee.txt")
	if err!=nil{
		fmt.Println(err)
		return
	}
	defer file.Close()
	Scanner:=bufio.NewScanner(file)
	for Scanner.Scan(){
		fmt.Println(Scanner.Text())
	}
	if err:=Scanner.Err();err!=nil{
		fmt.Println(err)
		return
	}
}