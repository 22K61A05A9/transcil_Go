package main
import "fmt"
type student struct{
	name string
	id int
}
func main(){
	stu:=student{
		name:"tom",
		id:101,
	}
	var s student
	s.name="jerry"
	s.id=120
	s1:=student{"cat",45}
	fmt.Println(stu)
	fmt.Println(s)
	fmt.Println(s1)
}