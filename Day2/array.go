package main
import "fmt" 
func main(){
	 a :=[5]int{1,2,3,4,5}
	for i:=0;i<len(a);i++{
		fmt.Println(a[i])
	}
	fmt.Println("array elements ")
	var arr [5]int
	fmt.Print("enter ele")
	for i:=0;i<5;i++{
		fmt.Scanln(&arr[i])
	}
}