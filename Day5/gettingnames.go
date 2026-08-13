package main
import ("fmt"
"os")
func main(){
	// files,_:=os.ReadDir(".")
	// for _,f:=range files{
	// 	if f.IsDir(){
    //        fmt.Println("Diretory ",f.Name())
	// 	}else{
	// 		fmt.Println("file ",f.Name())
	// 	}
	// }
	files,_:=os.ReadDir(".")
	for _,f:=range files{
		info,_:=f.Info()
		fmt.Println(info.Name())
		fmt.Println(info.Size())
		fmt.Println(info.Mode())
		fmt.Println(info.ModTime())
		fmt.Println("---")
	}

}