package main

import "fmt"

func main() {

	arr := [5]int{10,50,20,80,30}

	largest := arr[0]

	for _, value := range arr {

		if value > largest {

			largest = value

		}

	}

	fmt.Println("Largest =", largest)

}