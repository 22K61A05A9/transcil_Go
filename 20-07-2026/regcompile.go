package main
import (
	"fmt"
	"regexp"
)
func main() {
	re, err := regexp.Compile("abc")
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(re.MatchString("abcdef"))
}