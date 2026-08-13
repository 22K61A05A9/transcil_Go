package main
import("fmt"
"sync")
func main(){
	var wg sync.WaitGroup
	ch:=make(chan int)
	wg.Add(1)
	go func(){
		fmt.Println("hello")
		ch<-10
		defer wg.Done()
	}()
	c:=<-ch
	fmt.Println(c)
	wg.Wait()
}