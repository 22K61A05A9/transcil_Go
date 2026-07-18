package main
import ("fmt"
"time")
func main(){
	ticker:=time.NewTicker(2*time.Second)
	for i:=1;i<=5;i++{
		<-ticker.C
		fmt.Println("tick at ",i)
	}
	ticker.Stop()
}