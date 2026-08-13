package main
import "fmt"
type student struct{
	Name string
}
func (s student) greet(){
	fmt.Println("hi i am ",s.Name)
}
func main(){
	s:=student{Name:"Hari"}
	s.greet()
}