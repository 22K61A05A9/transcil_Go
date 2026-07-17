package main
import ("fmt"
"time")
func main(){
	ch2:=make(chan string)
	go func(){
	   time.Sleep(3*time.Second)
	   ch2<-"hello"
	}()
	select{
	case msg:=<-ch2:
		fmt.Println(msg)
	case<-time.After(2*time.Second):
		fmt.Print("timeout")
	}
}