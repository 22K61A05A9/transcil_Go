package main
import ("fmt"
"time")
func main(){
	ch:=make(chan string)
	go func(){
		time.Sleep(2*time.Second)
		ch<-"response"
	}()
	select{
	case msg:=<-ch:
		fmt.Println(msg)
    case <-time.After(3*time.Second):
	    fmt.Println("timeout")
	}
}