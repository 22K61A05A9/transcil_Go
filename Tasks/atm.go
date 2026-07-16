// An ATM needs to dispense a given amount of cash using the maximum number of currency notes possible (not the usual minimum), so students feel like they're getting more notes. Available denominations: ₹100, ₹200, ₹500, ₹1000. Given an amount, determine the combination of notes that maximizes note count while still summing exactly to the amount.

// Input: Amount to withdraw (and possibly a max notes-per-transaction limit N, depending on the variant)
// Output: Number of notes of each denomination, and/or total note count
// package main
import "fmt"
func main(){
  var n int
  fmt.Println("Enter amount")
  fmt.Scan(&n)
  cnth:=0
  cntt:=0
  cntf:=0
  cntth:=0
  if n<0 || n%100!=0{
	fmt.Println("Invalid")
  }
  for n>0{
	if n>=100 {
		cnth++
		n-=100
	}else if n>=200{
		cntt++
		n-=200
	}else if n>=500{
		cntf++
		n-=500
	}else if n>=1000{
		cntth++
		n-=1000
	}
  }
  fmt.Println("100 :",cnth)
  fmt.Println("Total notes:",cnth+cntt+cntf+cntth)
}
