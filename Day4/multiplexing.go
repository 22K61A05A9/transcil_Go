package main
import ("fmt"
"time")
func main(){
	ch1:=make(chan int)
	ch2:=make(chan int)
	go func(){
		time.Sleep(2*time.Millisecond)
		ch1<-1
	}()
	go func(){
		time.Sleep(5*time.Millisecond)
		ch2<-2
	}()
	select{
	case m:=<-ch1:
		fmt.Println(m)
	case m:=<-ch2:
		fmt.Println(m)
	}
}