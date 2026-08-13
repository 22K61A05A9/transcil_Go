package main
import "fmt"
func main() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered:", r)
		}
	}()
	defer fmt.Println("Program End")
	panic("Something went wrong")

}