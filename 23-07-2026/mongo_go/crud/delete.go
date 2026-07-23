package crud
import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)
func DeleteEmployees(collection *mongo.Collection) {
	filter := bson.M{
		"name":"Hari",
	}
	result, err := collection.DeleteMany(
		context.Background(),
		filter,
	)
	if err != nil {
		panic(err)
	}
	fmt.Println("Deleted :", result.DeletedCount)
}