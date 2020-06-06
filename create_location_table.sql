drop table if exists locations;
create table locations(
	UID int primary key not null,
	city_id tinyint not null,
	location_name text
);

load data local infile './locations.csv'
into table locations
character set utf8mb4
fields terminated by ','
lines terminated by '\n'
ignore 1 rows;
