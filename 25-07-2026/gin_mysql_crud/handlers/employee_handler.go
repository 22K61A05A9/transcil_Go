package handlers

import (
	"database/sql"
	"gin_mysql_crud/models"
	"github.com/gin-gonic/gin"
	"net/http"
)

func CreateEmployee(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var emp models.Employee
		err := c.BindJSON(&emp)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error()})
			return
		}
		result, err := db.Exec(
			"INSERT INTO employees(name, salary) VALUES(?, ?)",
			emp.Name,
			emp.Salary,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		id, err := result.LastInsertId()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		emp.ID = int(id)
		c.JSON(http.StatusCreated, gin.H{
			"message": "Employee created successfully",
			"id":      id,
		})
	}
}
func GetEmployees(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query("select id,name,salary from employees")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		defer rows.Close()
		var employees []models.Employee
		for rows.Next() {
			var emp models.Employee
			err := rows.Scan(
				&emp.ID,
				&emp.Name,
				&emp.Salary,
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
			employees = append(employees, emp)
		}
		c.JSON(http.StatusOK, gin.H{
			"employees": employees,
		})
	}
}
func GetEmployeeById(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var emp models.Employee
		err := db.QueryRow("select id,name,salary from employees where id=?", id).Scan(
			&emp.ID,
			&emp.Name,
			&emp.Salary,
		)
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Employee not found",
			})
			return
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, emp)
	}
}
func UpdateEmployee(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		id := c.Param("id")

		var emp models.Employee

		err := c.BindJSON(&emp)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		result, err := db.Exec(
			"UPDATE employees SET name = ?, salary = ? WHERE id = ?",
			emp.Name,
			emp.Salary,
			id,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Employee not found",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Employee updated successfully",
		})
	}
}
func DeleteEmployee(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		id := c.Param("id")

		result, err := db.Exec("DELETE FROM employees WHERE id = ?", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if rows, _ := result.RowsAffected(); rows == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Employee deleted successfully",
		})

	}
}
