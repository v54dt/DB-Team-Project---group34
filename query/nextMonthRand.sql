call getNextMonth();
select *
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and month(showInfo.time) = @nextMonth
and year(showInfo.time) = @nextMonthYear
;