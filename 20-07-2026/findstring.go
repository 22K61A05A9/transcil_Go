package main
import (
	"fmt"
	"regexp"
)
func main() {
	re := regexp.MustCompile(`[0-9]+`)
	text := "Order ID: 12345"
	fmt.Println(re.FindString(text))
	text1 := "A12 B34 C567"

	fmt.Println(re.FindAllString(text1, -1))
}