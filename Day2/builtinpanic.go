package main
import "fmt"
func main(){
	defer func(){
		if r:=recover();r!=nil{
			fmt.Println("recover",r)
		}
	}()
	//nil pointer
	var p *int
	fmt.Println(*p)
	//index out of bound
	arr:=[]int{20,102,203,38}
	fmt.Println(arr[5])
}