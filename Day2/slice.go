package main
import "fmt"
func main() {
	numbers := []int{10,20,30,40,50}
	fmt.Println(numbers)
	//append returns new slice
	fmt.Println(append(numbers,90))
	//append multiple vlaues
	fmt.Println(append(numbers,90,10))
	num:=[]int{1,2,3,5}
	//...spread operator
	fmt.Println(append(numbers,num ...))
	fmt.Println(len(numbers))
	fmt.Println(cap(numbers))
	n:=make([]int,3,5)
	fmt.Println(n)
	//another slice
	fmt.Println(numbers[1:2])
    a:=make([]int,len(numbers))
	copy(a,numbers)
	fmt.Println(a)
}