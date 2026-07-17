package main
import ("fmt"
"time")
func number(){
	for i:=1;i<=5;i++{
		fmt.Println(i)
		time.Sleep(50*time.Millisecond)
	}
}
func letter(){
	for ch:='A';ch<='E';ch++{
		fmt.Println(string(ch))
		time.Sleep(200*time.Millisecond)
	}
}
func main(){
	go number()
	go letter()
	time.Sleep(time.Second)
}