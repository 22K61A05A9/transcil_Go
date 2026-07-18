package main

import (
	"fmt"
	"time"
)

func main() {

	timer := time.NewTimer(5 * time.Second)
    fmt.Println("timer creates")
	fmt.Printf("timer %T",<-timer.C)
	timer.Stop()

	fmt.Println("Timer Stopped")
	fmt.Println("go")

}