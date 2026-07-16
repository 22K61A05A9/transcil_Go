package main
import ("fmt" 
         "sort")
func main(){
	a:=[]int{6,38,23,9,2,1}
	sort.Ints(a)
	fmt.Print(a)
	//decending order
	
	fmt.Print(sort.Sort(sort.Reverse(sort.IntSlice(a))))
}