package main

import (
	"fmt"
	"math"
)

func main() {
	var num int
	fmt.Print("Enter number:")
	fmt.Scan(&num)
	var n int = 0
	for num > 0 {
		num = num / 10
		n++
	}
	var digit int
	var sum int = 0
	for num > 0 {
		digit = num % 10
		sum += int(math.Pow(float64(digit), float64(n)))
		num = num / 10
	}
	if sum == num {
		fmt.Println("armstrong")
	} else {
		fmt.Println("not armstrong")
	}
}
