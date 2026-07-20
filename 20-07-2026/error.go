package main
import (
	"errors"
	"fmt"
)
func divide(a,b int)(int,error){
	if b==0{
		return 0, errors.New("cannot divide by zero")
	}
	return a/b,nil
}
func main(){
	res,err:=divide(50,10)
    if err!=nil{
		fmt.Println(err)
		return 
	}
	fmt.Println(res)
	name := "Hari"

	err1 := fmt.Errorf("user %s not found", name)
	fmt.Prinltn(err1)
}  