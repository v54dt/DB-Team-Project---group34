drop procedure if exists main;
drop procedure if exists cat_city_locations;

set @inputStartDate = "2019-09-01";
set @inputEndDate = "2020-03-20";
set @inputCityID = "1,2,3,4";
set @inputCategoryID = 1;
set @inputIsFree = 'Y';


delimiter //
create procedure cat_city_locations()
begin
	declare i int default 1;
	declare cnt int default 0;
	declare location_cur cursor for
		select location_name
		from locations
		where city_id = @curr_cityid
	;
	open location_cur;
	select count(UID) into cnt from locations where city_id = @inputCityID;
	
	while i<cnt do
		set @query = concat(@query, " or ");
		fetch location_cur into v_location_name;
		set @query = concat(@query, " instr(showInfo.location, \"", v_location_name, "\" collate utf8mb4_unicode_ci) ");
		set i=i+1;
	end while;
	close location_cur;
	

end //
delimiter ;

delimiter //
create procedure main()
begin 
	declare i int default 1;
	declare cnt int default 0;
	declare v_location_name text;
	select length(@inputCityID)-length(replace(@inputCityID,',',''))+1 into cnt;
	set @query = "
	select artshow.UID, showInfo.time, showInfo.location, artshow.category, showInfo.onsales
	from artshow, showInfo
	where artshow.UID = showInfo.artshowUID
	";
	set @curr_cityid = NULL;
	
	if not isnull(@inputStartDate) then
		set @query = concat(@query, " and showInfo.time >= @inputStartDate");
	end if;
	if not isnull(@inputEndDate) then
		set @query = concat(@query, " and showInfo.time <= @inputEndDate");
	end if;
	if not isnull(@inputCityID) then
		
		set @query = concat(@query, " and ( false ");
		while i <= cnt do
			select substring_index(substring_index("1,2,3,4",',',i),',',-1) into @curr_cityid;
			call cat_city_locations();
		end while;
		
		set @query = concat(@query, ")");
		
	end if;	
	if not isnull(@inputCategoryID) then
		set @query = concat(@query, " and artshow.category = @inputCategoryID");
	end if;
	if not isnull(@inputIsFree) then
		set @query = concat(@query, " and showInfo.onsales = @inputIsFree collate utf8mb4_unicode_ci");
	end if;
	prepare stmt from @query;
	execute stmt;
end//
delimiter ;

#call main();
#select @query;


