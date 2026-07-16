package main
import "fmt"
type student struct{
	name string
	age int
}
func display(s student){
	fmt.Printf("%s %d",s.name,s.age)
}
func main(){
	s:=student{"hari",16}
	display(s)
}