package main

import "fmt"

func main() {
	var num int
	fmt.Print("number")
	fmt.Scan(&num)
	var rev int = 0
	rem := 0
	for num > 0 {
		rem = num % 10
		rev = rev*10 + rem
		num = num / 10
	}
	fmt.Println("Reverse number:", rev)
}
