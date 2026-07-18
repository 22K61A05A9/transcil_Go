package main
import ("fmt"
"os"
"io")
func main(){
	src,_:=os.Open("employee.txt")
    dest,err:=os.Create("employee_copy.txt")
	if err!=nil{
		fmt.Println(err)
		return
	}
	bytescopied,err1:=io.Copy(dest,src)
	if err1!=nil{
		fmt.Println(err1)
		return
	}
    fmt.Println("copied",bytescopied)
}