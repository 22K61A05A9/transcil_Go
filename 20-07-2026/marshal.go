package main
import (
	 "encoding/json"
	"fmt"
)
type Student struct{
	Id int 
	Name string
	Age int
}
func main(){
  s := Student{
	Id:1,
	Name:"hari",
	Age:20,
  }
  jsonData,err:=json.Marshal(s)
  if err!=nil{
	fmt.Println(err)
	return 
  }
  fmt.Println(string(jsonData))
}