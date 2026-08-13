package main
import "fmt"
func main(){
	a:=[]int{1,2,3,6,7}
	i:=2
	val:=4
	//insert a value
	a=append(a[:i],append([]int{val},a[i:]...)...)
	fmt.Print(a," ")
	//delete a values
	b:=append(a[:2],a[len(a)-1:]...)
	fmt.Print(b," ")
}