package main
import "fmt"
func main(){
	stu:=[]struct{
		name string
		age int
	}{
		{
		name:"hari",
		age:20,
	   },
	   {
		 name:"priya",
		 age:21,
	  },
    }
	fmt.Println(stu)
}
