package main
import (
	//"context"
	"database/sql"
	"log"
	"strconv"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gin-gonic/gin"
	db "employee_api/db/generated"
)
type CreateEmployeeRequest struct{
	Name string  `json:"name"`
	Salary int   `json:"salary"`
}
func main() {
	dsn:="gouser:Go@123@tcp(localhost:3306)/employee_db"
	dbConn,err:=sql.Open("mysql",dsn)
	if err!=nil{
		log.Fatal("Error while connecting to DB",err)
	}
	err=dbConn.Ping()
	if err!=nil{
		log.Fatal("Error while pinging DB", err)
	}
	queries:=db.New(dbConn)
	_=queries
	router := gin.Default()
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "DB connected",
		})
	})
	router.POST("/employee_api",func(c *gin.Context){
        var emp CreateEmployeeRequest
		err:=c.BindJSON(&emp)
		if err!=nil{
		c.JSON(400, gin.H{
   		 "error": err.Error(),
		})
		return
	  }
		err=queries.CreateEmployee(c.Request.Context(),db.CreateEmployeeParams{
			Name:emp.Name,
			Salary:int32(emp.Salary),
		})
		if err!=nil{
			c.JSON(500, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(201, gin.H{
			"message": "Employee created successfully",
			"result": emp,
		})
	})
	router.GET("/employee_api",func(c *gin.Context){
		emps,err:=queries.GetEmployees(c.Request.Context())
		if err!=nil{
			c.JSON(500,gin.H{
				"error":err.Error(),
			})
			return
		}
		c.JSON(200,emps)
	})
	router.GET("/employee_api/:id", func(c *gin.Context){
		empid,err:=strconv.Atoi(c.Param("id"))
		if err!=nil{
			c.JSON(400, gin.H{
				"error":err.Error(),
			})
			return
		}
		emp,err:=queries.GetEmployee(c.Request.Context(),int32(empid))
		if err!=nil{
			c.JSON(500,gin.H{
				"error":err.Error(),
			})
			return
		}
		c.JSON(200,emp)
	})
	router.PUT("/employee_api/:id", func(c *gin.Context){
		empid,_:=strconv.Atoi(c.Param("id"))
		var emp CreateEmployeeRequest
		err:=c.BindJSON(&emp)
		if err!=nil{
			c.JSON(400, gin.H{
				"error":err.Error(),
			})
			return
		}
		err1:=queries.UpdateEmployee(c.Request.Context(),db.UpdateEmployeeParams{
			ID:int32(empid),
			Name:emp.Name,
			Salary:int32(emp.Salary),
		})
		if err1!=nil{
			c.JSON(500, gin.H{
				"error":err.Error(),
			})
			return
		}
		c.JSON(200, gin.H{
			"message":"Employee updated successfully",
			"result":emp,
		})
	})
	router.DELETE("/employee_api/:id",func(c *gin.Context){
		empid,_:=strconv.Atoi(c.Param("id"))
		err:=queries.DeleteEmployee(c.Request.Context(), int32(empid))
		if err!=nil{
			c.JSON(500, gin.H{
				"error":err.Error(),
			})
			return
		}
		c.JSON(200, gin.H{
			"message":"Employee deleted successfully",
			"result": empid,
		})
	})
	router.Run(":6081")
}