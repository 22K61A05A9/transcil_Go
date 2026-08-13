package crud

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Employee struct {
	ID     primitive.ObjectID `bson:"_id,omitempty"`
	Name   string             `bson:"name"`
	Age    int                `bson:"age"`
	Salary int                `bson:"salary"`
	City   string             `bson:"city"`
}

func InsertEmployee(collection *mongo.Collection) {

	employee := Employee{
		Name:   "Hari",
		Age:    22,
		Salary: 50000,
		City:   "Hyderabad",
	}

	result, err := collection.InsertOne(context.Background(), employee)

	if err != nil {
		panic(err)
	}

	fmt.Println("Inserted ID:", result.InsertedID)
}