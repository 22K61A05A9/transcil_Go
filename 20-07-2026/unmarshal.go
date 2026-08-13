package main
import (
	"encoding/json"
	"fmt"
)
type Student struct{
	Id int `json:"id"`
	Name string `json:"name"`
}
func main(){
	jsonData:=[]byte(`{
		"id":1,	
		"name":"abc"
	}`)
	var s Student
	err:=json.Unmarshal(jsonData,&s)
	if err!=nil{
		fmt.Println(err)
		return 
	}
	fmt.Println(s)
}