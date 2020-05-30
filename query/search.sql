drop procedure if exists main;

set @query = "
select artshow.UID, artshow.category
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
";
set @inputStartDate = NULL;
set @inputEndDate = NULL;
set @inputCityID = 0;
set @inputCategoryID = 1;

delimiter //
create procedure main()
begin 
	declare cnt int default 0;
	declare i int default 1;
	declare v_location_name text;
	declare location_cur cursor for
		select location_name
		from locations
		where city_id = @inputCityID
	;
	if not isnull(@inputStartDate) then
		set @query = concat(@query, " and showInfo.time >= @inputStartDate");
	end if;
	if not isnull(@inputEndDate) then
		set @query = concat(@query, " and showInfo.time <= @inputEndDate");
	end if;
	if not isnull(@inputCityID) then
		
		open location_cur;
		select count(UID) into cnt from locations where city_id = @inputCityID;
		set @query = concat(@query, " and ( false ");
		while i<cnt do
			set @query = concat(@query, " or ");
			fetch location_cur into location_name;
			set @query = concat(@query, " instr(showInfo.location,", location_name, " collate utf8mb4_unicode_ci) ");
			set i=i+1;
		end while;
		close location_cur;
		set @query = concat(@query, ")");
		
		
	end if;	
	if not isnull(@inputCategoryID) then
		set @query = concat(@query, " and artshow.category = @inputCategoryID");
	end if;
end//
delimiter ;

call main();
prepare stmt from @query;
execute stmt;


