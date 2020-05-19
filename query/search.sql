drop procedure if exists main;

set @query = "
select * 
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
";
set @inputStartDate = '2020-01-01';
set @inputEndDate = '2020-12-31';

delimiter //
create procedure main()
begin 

	if not isnull(@inputStartDate) then
		set @query = concat(@query, " and showInfo.time >= @inputStartDate");
	end if;
	if not isnull(@inputEndDate) then
		set @query = concat(@query, " and showInfo.time <= @inputEndDate");
	end if;
	
end//
delimiter ;

call main();
prepare stmt from @query;
execute stmt;



