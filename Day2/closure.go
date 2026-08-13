package main
import "fmt"
func main(){
	count:=0
	inc:=func(){
		count++
		fmt.Println("count",count)
	}
	inc()
	inc()
    inc()
	
}