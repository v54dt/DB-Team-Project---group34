drop procedure if exists main;
drop procedure if exists cat_city_locations;

#set inputs before calling main!
#set @inputStartDate = "2019-03-20";
#set @inputEndDate = "2020-12-31";
#set @inputCityID = "0,1,2,3,4";
#set @inputCategoryID = "4,5,6";
#set @inputIsFree = 'Y';


delimiter //
create procedure cat_city_locations()
begin
        declare i int default 1;
        declare cnt int default 0;
        declare v_location_name text;
        declare location_cur cursor for
                select location_name
                from locations
                where city_id = @curr_cityid
        ;
        open location_cur;
        select count(UID) into cnt from locations where city_id = @curr_cityid;
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

        set @query = "
        select artshow.UID, showInfo.time, showInfo.location, artshow.category, showInfo.onsales
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

			select length(@inputCityID)-length(replace(@inputCityID,',',''))+1 into cnt;
			set @query = concat(@query, " and ( false ");
			while i <= cnt do
					select cast(substring_index(substring_index(@inputCityID,',',i),',',-1) as unsigned) into @curr_cityid;
					call cat_city_locations();
					set i=i+1;
			end while;

			set @query = concat(@query, ")");

        end if;
		
        if not isnull(@inputCategoryID) then
			set i = 1;
			select length(@inputCategoryID)-length(replace(@inputCategoryID,',',''))+1 into cnt;
			set @query = concat(@query, " and ( false ");
			while i <= cnt do
				select substring_index(substring_index(@inputCategoryID,',',i),',',-1) into @tmp_id;
				set @query = concat(@query, " or artshow.category = ", @tmp_id);
				set i=i+1;
			end while;
			set @query = concat(@query, ")");
        end if;
		
        if not isnull(@inputIsFree) then
			set @query = concat(@query, " and showInfo.onsales = @inputIsFree collate utf8mb4_unicode_ci");
        end if;
		
        prepare stmt from @query;
        execute stmt;
		
		#cleanup
		set @curr_cityid = NULL;
		set @tmp_id = NULL;
end//
delimiter ;

#call main();
#select @query;
