package crud
import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)
func FindEmployee(collection *mongo.Collection){
	var employee Employee
	filter:=bson.M{
		"name":"Hari",
	}
	err:=collection.FindOne(context.Background(),filter).Decode(&employee)
	if err!=nil{
		fmt.Println(err)
	}
	fmt.Printf("Employee details %+v\n",employee)
}
func FindAllEmployees(collection *mongo.Collection) {

	cursor, err := collection.Find(context.Background(), bson.M{})

	if err != nil {
		panic(err)
	}

	defer cursor.Close(context.Background())

	fmt.Println("Employees List")

	for cursor.Next(context.Background()) {

		var employee Employee

		err := cursor.Decode(&employee)

		if err != nil {
			panic(err)
		}

		fmt.Printf("%+v\n", employee)
	}

	if err := cursor.Err(); err != nil {
		panic(err)
	}
}