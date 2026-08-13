package main
import (
	"encoding/csv"
	"fmt"
	"os"
)
func main() {
	file, err := os.Create("students.csv")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()
	writer := csv.NewWriter(file)
	record := []string{"1", "Hari", "21"}
	err = writer.Write(record)
	if err != nil {
		fmt.Println(err)
		return
	}
	writer.Flush()
	fmt.Println("CSV file created successfully")
}
