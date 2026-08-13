package main
import "fmt"
func main(){
	name:="student"
	for i:=len(name)-1;i>=0;i--{
		fmt.Printf("%c",name[i])
	}
	//range func
	for _,val:=range name{
		fmt.Print(string(val))
	}
	//len
	fmt.Println(len(name))
	r:=[]rune(name)
	fmt.Println(len(r))
	n:="これ"// each charater ocuppies multiple bytes
	fmt.Println(len(n))
	//byte
	b:=[]byte(name)
	b[0]='t'
	fmt.Println(string(b))
}