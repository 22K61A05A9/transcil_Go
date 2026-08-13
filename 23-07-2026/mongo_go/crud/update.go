package crud
import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)
func UpdateEmployee(collection *mongo.Collection) {
	filter := bson.M{
		"name": "Hari",
	}

	update := bson.M{
		"$set": bson.M{
			"salary": 75000,
		},
	}
	result, err := collection.UpdateOne(
		context.Background(),filter,update,
	)
	if err != nil {
		panic(err)
	}
	fmt.Println("Matched Documents :", result.MatchedCount)
	fmt.Println("Modified Documents:", result.ModifiedCount)
}