use company;
select * from ev_vehicles;
desc ev_vehicles;
set SQL_SAFE_UPDATES=0;

-- 1.Data Cleaning: Standardize manufacture_date into a single YYYY-MM-DD format (it currently has 3 different formats mixed in). Then find all vehicles manufactured after Jan 1, 2024.

UPDATE ev_vehicles
SET manufacture_date = DATE_FORMAT(
    STR_TO_DATE(manufacture_date, '%d/%m/%Y'),
    '%Y-%m-%d'
)
WHERE manufacture_date LIKE '__/__/____';
UPDATE ev_vehicles
SET manufacture_date = DATE_FORMAT(
    STR_TO_DATE(manufacture_date, '%d-%m-%Y'),
    '%Y-%m-%d'
)
WHERE manufacture_date LIKE '__-__-____';
UPDATE ev_vehicles
SET manufacture_date = DATE_FORMAT(
    STR_TO_DATE(manufacture_date, '%m-%d-%Y'),
    '%Y-%m-%d'
)
WHERE manufacture_date LIKE '__-__-____';
UPDATE ev_vehicles
SET manufacture_date = DATE_FORMAT(
    STR_TO_DATE(manufacture_date, '%d-%m-%Y'),
    '%Y-%m-%d'
)
WHERE manufacture_date LIKE '__-__-____';
select * from ev_vehicles;
select * from ev_vehicles where manufacture_date > '2024-01-01';

-- 2. Grouped Aggregation: Calculate the average range_km per company_name, sorted descending. Which manufacturer has the best average range?

select company_name , AVG(range_km) from ev_vehicles 
group by company_name order by avg(range_km)desc limit 1;

-- 3. Missing Data Handling: Identify all rows with missing values in warranty_years, odometer_km, or is_certified_pre_owned. Decide and justify a strategy (drop vs. impute) for each column, then apply it.

update ev_vehicles set odometer_km=(
select AVG(odometer_km) from (
select odometer_km from ev_vehicles 
where odometer_km IS NOT NULL) as t
)
where odometer_km IS NULL;
select odometer_km from ev_vehicles;
select warranty_years from ev_vehicles;

-- 4. Multi-condition Filter: Find all vehicles where battery_chemistry == "LFP" AND price_usd < 50000 AND region_sold is either "India" or "Asia Pacific" — these represent budget-friendly LFP EVs in key growth markets.

select * from ev_vehicles where battery_chemistry = "LFP"
 AND price_usd < 50000 AND 
(region_sold ="India" or region_sold="Asia Pacific");

-- 5. Derived Metric: Create a new computed column price_per_kwh (price_usd / battery_capacity_kwh) and price_per_km_range (price_usd / range_km). Rank the top 5 most cost-efficient vehicles by price_per_km_range

select model_name,(price_usd / battery_capacity_kwh) as price_per_kwh ,
(price_usd / range_km) as price_per_km_range
 from ev_vehicles order by price_per_km_range asc limit 5;