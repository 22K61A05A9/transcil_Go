package main
import "fmt"
type college struct{
	name string
	id int
}
func main(){
	s:=[3]college{
		{"hari",1},
		{"mohan",2},
		{"sri",3},
	}
	fmt.Println(s)
	for _,v:=range s{
		fmt.Println(v.name," ",v.id)
	}
}