package main
import "fmt"
func main(){
	fib1:=0
	fib2:=1
	var num int
	fmt.Print("num")
	fmt.Scan(&num)
	fmt.Print(fib1," ",fib2," ")
	for i:=1;i<=num;i++{
		fib3:=fib1+fib2
		fmt.Print(fib3," ")
		fib1=fib2
		fib2=fib3
	}
}