drop procedure if exists main;

set @inputStartDate = "2019-09-01";
set @inputEndDate = "2020-03-20";
set @inputCityID = 0;
set @inputCategoryID = 1;
set @inputIsFree = 'Y'

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
	set @query = "
	select artshow.UID, showInfo.time, showInfo.location, artshow.category
	from artshow, showInfo
	where artshow.UID = showInfo.artshowUID
	";
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
			fetch location_cur into v_location_name;
			set @query = concat(@query, " instr(showInfo.location, \"", v_location_name, "\" collate utf8mb4_unicode_ci) ");
			set i=i+1;
		end while;
		close location_cur;
		set @query = concat(@query, ")");
		
		
	end if;	
	if not isnull(@inputCategoryID) then
		set @query = concat(@query, " and artshow.category = @inputCategoryID");
	end if;
	if not isnull(@inputIsFree) then
		set @query = concat(@query, " and showInfo.onsales = @inputIsFree");
	end if;
	prepare stmt from @query;
	execute stmt;
end//
delimiter ;

#call main();
#select @query;


