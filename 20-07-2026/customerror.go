package main
import "fmt"
type UserError struct {
	ID int
}
func (e UserError) Error() string {
	return fmt.Sprintf("user with ID %d not found", e.ID)
}
func getUser(id int) error {
	if id != 1 {
		return UserError{ID: id}
	}
	return nil
}
func main() {
	err := getUser(25)
	if err != nil {
		fmt.Println(err)
	}
}
