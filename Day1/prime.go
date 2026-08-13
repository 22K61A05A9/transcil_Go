package main

import "fmt"

func main() {
	var num int
	var count int = 0
	fmt.Print("enter number:")
	fmt.Scan(&num)
	for i := 1; i <= num; i++ {
		if num%i == 0 {
			count++
		}
	}
	if count == 2 {
		fmt.Println("Prime number")
	} else {
		fmt.Println("Not a prime")
	}
}
