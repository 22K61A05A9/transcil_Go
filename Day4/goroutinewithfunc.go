package main
import ("fmt"
"time")
func greet(){
	fmt.Println("hello from greet")
}
func main(){
	go greet()
	time.Sleep(time.Second)
}
