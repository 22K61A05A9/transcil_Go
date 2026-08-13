package main
import "github.com/gin-gonic/gin"
func main(){
	router:=gin.Default()
    router.GET("/hello",func(c *gin.Context){
		c.JSON(200,gin.H{
			"msg":"hello! welcome to server",

		})
		})
		router.GET("/employees", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Fetching all employees",
		})
	})

	router.POST("/employees",func(c *gin.Context){
		c.JSON(201,gin.H{
			"msg":"employee created",

		})
		})
		router.PUT("/employees", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Employee Updated",
		})
	})

	router.DELETE("/employees", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Employee Deleted",
		})
	})
	router.GET("/students/:id/:name", func(c *gin.Context) {
	id := c.Param("id")
	name := c.Param("name")
	c.JSON(200, gin.H{
		"id": id,
		"name": name,
	})
})
router.GET("/search", func(c *gin.Context) {
	id := c.Query("id")
	c.JSON(200, gin.H{
		"id": id,
	})
})
		router.Run(":6080")
}
