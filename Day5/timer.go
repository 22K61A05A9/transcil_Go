package main
import ("fmt"
"time")
func main(){
	// timer:=time.NewTimer(5*time.Second)
	fmt.Println("waiting....")
	// <-timer.C
	<-time.After(3*time.Second)
	fmt.Println("time out")
}