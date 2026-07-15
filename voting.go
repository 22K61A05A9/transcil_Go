package main

import "fmt"

func main() {
	var age int = 21
	if age >= 18 {
		fmt.Println("eligible to vote")
	} else {
		fmt.Println("not eligible to vote")
	}
}
