package main

import "fmt"

func calculate(a, b int) (int, int) {
	return a + b, a * b
}
func main() {
	sum, product := calculate(10, 20)
	fmt.Println("sum", sum)
	fmt.Println("Product", product)
}
