package main
import "fmt"
func receiveonly(ch <-chan int){
     fmt.Println(<-ch)
}
func main(){
	ch:=make(chan int)
	go receiveonly(ch)
    ch<-100
}