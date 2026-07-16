package main
import "fmt"
type Student struct{
	name string
	add Add
}
type Add struct{
     city string
	 state string
}
func main(){
	s:=Student{
		name:"hari",
		add:Add{
			city:"hyd",
			state:"TN",
		},
	}
	fmt.Println(s)
	fmt.Println(s.add.city)
}