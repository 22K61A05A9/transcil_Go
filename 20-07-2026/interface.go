package main
import "fmt"
type Payment interface{
	Pay(amount float64)
}
type Card struct{}
func (c Card)Pay(amount float64){
   fmt.Println("Paid",amount)
}
type Upi struct{}
func(u Upi)Pay(amount float64){
	fmt.Println("paid through upi",amount)
}
func checkout(P Payment){
 P.Pay(500)
}
func main(){
	checkout(Card{})
	checkout(Upi{})
}