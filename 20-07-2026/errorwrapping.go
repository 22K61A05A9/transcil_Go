package main
import (
	"fmt"
	"os"
)
func loadConfig() error {
	_, err := os.ReadFile("config.json")
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}
	return nil
}
func main() {
	err := loadConfig()
	if err != nil {
		fmt.Println(err)
	}
}