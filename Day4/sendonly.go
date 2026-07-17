package main
import "fmt"
func sendonly(ch chan<- int){
	ch<-100
}
func main(){
   ch:=make(chan int)
   go sendonly(ch)
   fmt.Println(<-ch)
}