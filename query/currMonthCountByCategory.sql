
drop procedure if exists currMonthCountByCategory

delimiter //
create procedure currMonthCountByCategory()
begin

	declare curr_category_id int default 0;
	declare category_id_cnt int default 13;
	declare cnt int default 1;
	
	truncate table category_count;
	set @val = "";
	set @categoryIDs = "1,2,3,4,5,6,7,8,11,13,14,15,17";
	
	set @inputStartDate = concat(substring_index(curdate(),'-',2),"-01");
	set @inputEndDate = last_day(curdate());
	set @inputCityID = NULL;
	set @inputCategoryID = NULL;
	set @inputIsFree = NULL;

	while cnt<=category_id_cnt do
	
		set @inputCategoryID = substring_index(substring_index(@categoryIDs,',',cnt),',',-1);
		call main_noexec();
		set @s1 = concat(
		"select count(*) into @cnt from (",
		@query,") as t"
		);
		prepare stmt1 from @s1;
		execute stmt1;
		set @val = concat(@val,@cnt,',');
		set cnt = cnt + 1;
		
	end while;
	
	set @val = substring_index(@val,',',max_city_id);
	set @s1 = concat("insert into category_count values (", @val ,")");
	prepare stmt from @s1;
	execute stmt;

end //
delimiter ;
