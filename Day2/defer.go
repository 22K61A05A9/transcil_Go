package main
import "fmt"
func main(){
	fmt.Println("hi")
	defer fmt.Println("Good Bye")
	fmt.Println("Hello")
	fmt.Println("My name is Hari")
	defer fmt.Println("1")
	defer fmt.Println("2")
	defer fmt.Println("3")
}