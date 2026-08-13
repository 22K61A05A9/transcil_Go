package main
import ("fmt"
"sync")
func greet(wg *sync.WaitGroup){
	fmt.Println("hari")
	defer wg.Done()
}
func main(){
	var wg sync.WaitGroup
	wg.Add(1)
	go greet(&wg)
	wg.Wait()
	fmt.Println("done")
}