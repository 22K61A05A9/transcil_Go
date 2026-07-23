package main
import ("fmt"
"context"
"time"
"mongo_go/crud"
"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)
func main(){
	ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
	defer cancel()
	client,err:=mongo.Connect(
		ctx, options.Client().ApplyURI("mongodb://localhost:27017"),
	)
	if err!=nil{
		panic(err)
	}
	defer client.Disconnect(ctx)
	err=client.Ping(ctx,nil)
	if err!=nil{
		panic(err)
	}
	fmt.Println("Successfully Connected to MongoDB!")
	collection:=client.Database("company").Collection("employees")
    crud.InsertEmployee(collection)
	crud.FindEmployee(collection)
	crud.FindAllEmployees(collection)
	crud.UpdateEmployee(collection)
	crud.DeleteEmployees(collection)
}