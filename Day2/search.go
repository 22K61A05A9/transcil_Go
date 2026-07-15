package main
import "fmt"
func main(){
	arr:=[6]int{10,202,20,90,9,4}
	search:=90
	found:=false
	for _,val:=range arr{
		if val==search{
			found=true
			break
		}
	}
	if found{
		fmt.Println("found")
	}else{
		fmt.Println("Not found")
	}
}