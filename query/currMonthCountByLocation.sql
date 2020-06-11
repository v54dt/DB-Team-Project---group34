set @currMonth = month(curdate());



drop procedure if exists currMonthCountByLocation;
delimiter //
create procedure currMonthCountByLocation()
begin
	
	declare curr_city_id int default 0;
	declare max_city_id int default 0;
	
	set @o = "";
	set @inputStartDate = concat(substring_index(curdate(),'-',2),"-01");
	set @inputEndDate = last_day(curdate());
	set @inputCategoryID = NULL;
	set @inputIsFree = NULL;
	
	select max(city_id) into max_city_id from locations;
	while curr_city_id<=max_city_id do
	
		set @inputCityID = cast(curr_city_id as char);
		call main_noexec();
		set @s1 = concat(
		"select count(*) into @cnt from (",
		@query,") as t"
		);
		prepare stmt1 from @s1;
		execute stmt1;
		set @o = concat('"', curr_city_id, '",', '"', @cnt, '"\n')
		
	end while;
	select @o into outfile '/var/lib/mysql-files/currMonthCountByLocation.csv';
end //
delimiter ;