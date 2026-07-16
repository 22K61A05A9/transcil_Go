package main
import (
	"fmt" 
    "strings")
func main(){
	fmt.Println(strings.Contains("Golang","Go"))
	fmt.Println(strings.ToUpper("Golang"))
    fmt.Println(strings.ToLower("Golang"))
	fmt.Println(strings.Replace("I like Java", "Java", "Go", 1))
	fmt.Println(strings.Split("Go,Java,Python", ","))
	
	arr := []string{"Go","Java","Python"}
	fmt.Println(strings.Join(arr, ","))
	fmt.Println(strings.Trim("  GO "," "))//Trimspace
	fmt.Println(strings.HasPrefix("golang","go"))
	fmt.Println(strings.HasSuffix("golang","lang"))
     words := strings.Fields("I Love Go")
    fmt.Println(len(words))
}