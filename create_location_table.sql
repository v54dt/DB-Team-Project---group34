drop table if exists locations;
create table locations(
	city_id tinyint not null,
	location_name text primary key not null
);

load data local infile './locations.csv'
into table locations
fields terminated by ','
lines terminated by '\r\n'
ignore 1 lines;