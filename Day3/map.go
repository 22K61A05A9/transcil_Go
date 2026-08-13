package main
import "fmt"
func main(){
	marks:=map[string]int{
		"hari":90,
		"priya":87,
	}
	fmt.Println(marks)
	mark := make(map[string]int)
   	mark["Hari"] = 90
	mark["Priya"] = 95
	fmt.Println(mark)
	fmt.Println(marks["hari"])
	delete(marks, "hari")
	students := map[string]map[string]int{
     "ari":{

		"Math":90,

		"Science":95,

	},
   }
   fmt.Println(students)
}