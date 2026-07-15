package main

import "fmt"

func main() {
	var day int
	fmt.Print("enter  day")
	fmt.Scan(&day)
	switch day {
	case 1:
		fmt.Print("Monday")
		fallthrough
	case 2:
		fmt.Print("Tuesday")
	case 3:
		fmt.Print("Wednesday")
		fallthrough
	default:
		fmt.Print("Invalid day")
	}
}
