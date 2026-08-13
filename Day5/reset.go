package main
import ("fmt"
"time")
func main(){
	timer:=time.NewTimer(100*time.Second)
	timer.Reset(200*time.Second)
	<-timer.C
	fmt.Println("Done")
}