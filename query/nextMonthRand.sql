


drop procedure if exists getNextMonth;
delimiter //

create procedure getNextMonth()
begin

	set @nextMonth = month(curdate());
	set @nextMonthYear = year(curdate());
	if @nextMonth = 12 then
		set @nextMonth = 1;
		set @nextMonthYear = @nextMonthYear + 1;
	else
		set @nextMonth = @nextMonth + 1;
	end if;

end//
delimiter ;


call getNextMonth();
select *
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and month(showInfo.time) = @nextMonth
and year(showInfo.time) = @nextMonthYear
order by rand()
limit 1
;