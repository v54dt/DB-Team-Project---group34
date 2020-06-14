





call getNextMonth();

select floor(rand()*count(*))+1
into @idx
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and month(showInfo.time) = @nextMonth
and year(showInfo.time) = @nextMonthYear
;

select *
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and month(showInfo.time) = @nextMonth
and year(showInfo.time) = @nextMonthYear
limit @idx-1,@idx
; 