package main

import "fmt"

func main() {
	var num, original int
	var rev int = 0
	var rem int
	fmt.Print("num:")
	fmt.Scan(&num)
	original = num
	for num > 0 {
		rem = num % 10
		rev = rev*10 + rem
		num = num / 10
	}
	if original == rev {
		fmt.Println("palindrome")
	} else {
		fmt.Println("not palindrome")
	}
}
