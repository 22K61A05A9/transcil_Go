// Assignment: 5 Query Questions 
package main
import ("fmt"
"encoding/json"
"os"
"sort"
"time"
) 
type Response struct {
	Metadata  Metadata   `json:"metadata"`
	Shipments []Shipment `json:"shipments"`
}
type Metadata struct {
    Generated_on   string `json:"generated_on"`
    Record_count   int `json:"record_count"`
    Schema_version string `json:"schema_version"`
}
type Shipment struct{
    Shipment_id string `json:"shipment_id"`
	OrderID            string          `json:"order_id"`
	Carrier            string          `json:"carrier"`
	Status             string          `json:"status"`
	IsInternational    bool            `json:"is_international"`
	Origin             Origin          `json:"origin"`
	Destination        Destination     `json:"destination"`
	Items              []Item          `json:"items"`
	CostBreakdown      CostBreakdown   `json:"cost_breakdown"`
	WeightKg           float64         `json:"weight_kg"`
	CreatedAt          string          `json:"created_at"`
	EstimatedDelivery  string          `json:"estimated_delivery"`
	TrackingEvents     []TrackingEvent `json:"tracking_events"`
}
type Origin struct {
	Country      string `json:"country"`
	City         string `json:"city"`
	WarehouseCode string `json:"warehouse_code"`
}
type Destination struct {
	Country    string `json:"country"`
	City       string `json:"city"`
	AddressLine string `json:"address_line"`
	PostalCode string `json:"postal_code"`
}
type Item struct {
	SKU       string  `json:"sku"`
	Name      string  `json:"name"`
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unit_price"`
}
type CostBreakdown struct {
	BaseRate       float64 `json:"base_rate"`
	FuelSurcharge  float64 `json:"fuel_surcharge"`
	Insurance      float64 `json:"insurance"`
	Tax            float64 `json:"tax"`
	Total          float64 `json:"total"`
	Currency       string  `json:"currency"`
}
type TrackingEvent struct {
	Timestamp    string `json:"timestamp"`
	Location     string `json:"location"`
	StatusUpdate string `json:"status_update"`
}
func main(){
	file,err:=os.ReadFile("shipping_data.json")
	if err!=nil{
		fmt.Println(err)
		return
	}
	var response Response
	err1:=json.Unmarshal(file,&response)
	if err1!=nil{
		fmt.Println(err1)
		return
	}
	// 1. Filtering + Sorting: 
  	// Find all shipments where status is "Delayed" or "Customs Hold", 
	// and sort them by estimated_delivery in ascending order.
	var filtered_shipments []Shipment
	for _,ship:=range response.Shipments{
		if ship.Status=="Delayed"||ship.Status=="Customs Hold"{
			filtered_shipments=append(filtered_shipments,ship)
		}
	}
	sort.Slice(filtered_shipments, func(a,b int) bool{
		return filtered_shipments[a].EstimatedDelivery<filtered_shipments[b].EstimatedDelivery
	})
	for _,sorted:=range filtered_shipments{
		fmt.Println(sorted.EstimatedDelivery," ",sorted.Status)
	}
    // 2. Aggregation:
	//  Calculate the total revenue (cost_breakdown.total) grouped by 
	//  carrier. Which carrier generated the most revenue?
	revenue:=make(map[string]float64)
	for _,r:=range response.Shipments{
		revenue[r.Carrier]+=r.CostBreakdown.Total
	}
	max_revenue:=0.0
	max_carrier:=""
	for c,t:=range revenue{
	if max_revenue<t{
		max_revenue=t
		max_carrier=c
	}
 }
	fmt.Println(revenue)
	fmt.Println(max_revenue)
	fmt.Println(max_carrier)
	//3. Nested Array Traversal:
	//  For each shipment, find the number of hours between the first 
	//  and last event in tracking_events.
	//   Return the shipment with the longest total transit time.
	var maxHours float64
	var maxShipment Shipment
	for _,event:=range response.Shipments{
        first:=event.TrackingEvents[0]
		last:=event.TrackingEvents[len(event.TrackingEvents)-1]
		t1, _ := time.Parse(time.RFC3339, first.Timestamp)
    	t2, _ := time.Parse(time.RFC3339, last.Timestamp)
    	diff := t2.Sub(t1).Hours()
		if diff>maxHours{
			maxHours=diff
			maxShipment=event
		}
	} 
	fmt.Println("Shipment id :",maxShipment.Shipment_id," Max Hours : ",maxHours)
	fmt.Printf("Transit time: %.2f hours\n",maxHours)
	// 4. Cross-field Logic:
	// Identify all is_international shipments where weight_kg > 20
	// and cost_breakdown.insurance == 0.
	// These represent heavy international shipments with no insurance
	//  — flag them as a "risk report."
	fmt.Println("risk report")
	// var risk_report []Shipment
	for _,r:=range response.Shipments{
		if r.IsInternational && r.WeightKg>20 && r.CostBreakdown.Insurance==0{
			// risk_report=append(risk_report, r)
			fmt.Println(r)
		} 
	}
    // 5. Multi-level Grouping: 
	// Build a summary object grouping shipments by destination.country,
	//  and within each country, count shipments per status. 
	//        Output should look like: 
	// { "USA": { "Delivered": 3, "Delayed": 1 }, 
	// "India": { "In Transit": 2 } }
    summary:=make(map[string]map[string]int)
	for _,s:=range response.Shipments{
		country:=s.Destination.Country
		status:=s.Status
		if summary[country]==nil{
			summary[country]=make(map[string]int)
		}
		summary[country][status]++
	}
	res,err:=json.MarshalIndent(summary,""," ")
	if err!=nil{
		fmt.Println(err)
		return
	}
	fmt.Println(string(res))
}