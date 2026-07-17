package main
import ("fmt"
"sync")
func greet(id int,wg *sync.WaitGroup){
	defer wg.Done()
	fmt.Println("hello",id)
}
func main(){
	var wg sync.WaitGroup
	for i:=1;i<=5;i++{
		wg.Add(1)
		go greet(i,&wg)
	}
	wg.Wait()
	fmt.Println("done")
}