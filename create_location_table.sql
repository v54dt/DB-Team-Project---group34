drop table if exists locations;
create table locations(
	UID int primary key not null,
	city_id tinyint not null,
	location_name text
);
