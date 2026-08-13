package main
import "fmt"
func add(numbers ...int){
	sum:=0
	for _,value:=range numbers{
		sum+=value
	}
	fmt.Println("sum",sum)
}
func main(){
	add(10,20)
    add(30,40,50,60)
	add(1)
	add(3,4,6)
}