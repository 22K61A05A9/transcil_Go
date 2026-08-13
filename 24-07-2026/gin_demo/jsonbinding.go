package main
import "github.com/gin-gonic/gin"
type Employee struct{
	Name string `json:"name"`
	Id int `json:"id"`
	Dept string `json:"dept"`
	Salary int `json:"salary"`
}
func main(){
	router:=gin.Default()
	router.POST("/employee",func(c *gin.Context){
		var emp Employee
		err:=c.BindJSON(&emp)
		if err!=nil{
			c.JSON(400,gin.H{
				"error":err.Error(),
			})
			return
		}
		c.JSON(200,gin.H{
			"message":"Employee created",
			"employee":emp,
		})
	})
	router.Run(":6080")
}