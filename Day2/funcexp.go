package main
import "fmt"
func main(){
	add:=func(numbers ... int){
		sum:=0
		for _,val:=range numbers{
			sum+=val
		}
		fmt.Println("sum",sum)
	}
	add(102,03,30)
}