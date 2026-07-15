package main

import "fmt"

func main() {
	var a int = 10
	var b int = 20
	fmt.print("before Swap a=", a, "b=", b)
	a = a + b
	b = a - b
	a = a - b
	fmt.Println("after swap a=", a, "b=", b)
}
