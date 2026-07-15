package main

import "fmt"

func main() {
	name := "hari"
	age := 21
	fmt.Printf("My name is %s and my age is %d", name, age)
	var names string
	var company string
	fmt.Println("enter name")
	fmt.Scanln(&names)

	fmt.Scan(&company)
	fmt.Print("company=", company)
}
