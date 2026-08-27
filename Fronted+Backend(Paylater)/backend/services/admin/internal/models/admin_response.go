package models

type AdminResponse struct {
	ID        int32  `json:"id"`
	AdminName string `json:"admin_name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
}
