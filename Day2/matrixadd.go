package main

import "fmt"

func main() {

	a := [2][2]int{

		{1,2},

		{3,4},

	}

	b := [2][2]int{

		{5,6},

		{7,8},

	}

	var result [2][2]int

	for i:=0;i<2;i++{

		for j:=0;j<2;j++{

			result[i][j]=a[i][j]+b[i][j]

		}

	}

	fmt.Println(result)

}