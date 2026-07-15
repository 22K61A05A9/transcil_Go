package main

import (
	"fmt"
	"os"
)

func main() {

	file, err := os.Open("data.txt")
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}

	defer file.Close()
	fmt.Println("File opened successfully!")

}