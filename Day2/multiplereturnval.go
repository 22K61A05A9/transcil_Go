package main
import "fmt"
func cal(a, b int)(int ,int){
	return a+b,a*b
}
func main(){
   sum,Product:=cal(2,4)
   fmt.Println("sum",sum)
   fmt.Println("Product",Product)
}