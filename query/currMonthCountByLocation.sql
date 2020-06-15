set @currMonth = month(curdate());

drop procedure if exists currMonthCountByLocation;
delimiter //
create procedure currMonthCountByLocation()
begin
	
	declare curr_city_id int default 0;
	declare max_city_id int default 0;
	
	truncate table summary;
	set @val = "";
	set @inputStartDate = concat(substring_index(curdate(),'-',2),"-01");
	set @inputEndDate = last_day(curdate());
	set @inputCategoryID = NULL;
	set @inputIsFree = NULL;
	
	select max(city_id)+1 into max_city_id from locations;
	while curr_city_id<=max_city_id do
	
		set @inputCityID = cast(curr_city_id as char);
		call main_noexec();
		set @s1 = concat(
		"select count(*) into @cnt from (",
		@query,") as t"
		);
		prepare stmt1 from @s1;
		execute stmt1;
		set @val = concat(@val,@cnt,',');
		set curr_city_id = curr_city_id + 1;
		
	end while;
	
	set @val = substring_index(@val,',',max_city_id);
	set @s1 = concat("insert into summary values (", @val ,")");
	prepare stmt from @s1;
	execute stmt;
	
end //
delimiter ;