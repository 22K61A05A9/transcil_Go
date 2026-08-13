package main
import "fmt"
func main(){
	arr:=[]int{1,2,3,4,5}
	for i:=len(arr)-1;i>=0;i--{
		fmt.Print(arr[i])
	}
}