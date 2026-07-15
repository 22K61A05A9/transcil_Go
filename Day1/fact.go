package main

import "fmt"

func main() {
	var num int
	var fact int = 1
	fmt.Print("numnber")
	fmt.Scan(&num)
	for i := 1; i <= num; i++ {
		fact = fact * i
	}
	fmt.Println("factorial", fact)
}
