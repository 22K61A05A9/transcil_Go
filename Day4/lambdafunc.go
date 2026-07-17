package main
import ("fmt"
"time")
func main(){
	go func(){
		fmt.Print("hari")
	}()
	time.Sleep(time.Second)
	fmt.Print("priya")
}