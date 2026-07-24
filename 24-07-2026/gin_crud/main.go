package main
import ("github.com/gin-gonic/gin"
"strconv")
type Employee struct{
	ID int `json:"id"`
	Name string `json:"name"`
	Salary int `json:"salary"`
}
func main(){
	var employees []Employee
	r:=gin.Default()
	r.POST("/emp",func(c *gin.Context){
		var emp Employee
		if err:=c.BindJSON(&emp); err!=nil{
			c.JSON(400,gin.H{
				"error":err.Error(),
			})
			return
		}
		employees=append(employees,emp)
		c.JSON(200,gin.H{
			"message":"success",
			"employee":emp,
		})
	})
	r.GET("/emp",func(c *gin.Context){
		c.JSON(200,employees)
	})
	r.GET("/emp/:id",func(c *gin.Context){
		id,_:=strconv.Atoi(c.Param("id"))
		for _,emp:=range employees{
			if emp.ID==id{
				c.JSON(200,emp)
				return
			}
		}
		c.JSON(400,gin.H{
			"message":"Not found",
		})
		//update
    r.PUT("/emp/:id", func(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid employee ID",
		})
		return
	}
	var updated Employee
	if err := c.BindJSON(&updated); err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}
	for i, emp := range employees {
		if emp.ID == id {
			updated.ID = id
			employees[i] = updated
			c.JSON(200, gin.H{
				"message":  "Employee Updated",
				"employee": updated,
			})
			return
		}
	}
	c.JSON(404, gin.H{
		"message": "Employee Not Found",
	})
	})
})
	r.DELETE("/emp/:id", func(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid employee ID",
		})
		return
	}
	for i, emp := range employees {
		if emp.ID == id {
			employees = append(employees[:i], employees[i+1:]...)
			c.JSON(200, gin.H{
				"message": "Employee Deleted",
			})
			return
		}
	}
	c.JSON(404, gin.H{
		"message": "Employee Not Found",
	})
	})
	r.Run(":6080")
}