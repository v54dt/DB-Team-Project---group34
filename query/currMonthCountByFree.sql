set @currMonth = month(curdate());
set @currYear = year(curdate());

truncate table OnSale_info;

select count(*) into @notFreeCount
from(
	select showInfo.onSales
	from artshow, showInfo
	where artshow.UID = showInfo.artshowUID
	and month(showInfo.time) = @currMonth
	and year(showInfo.time) = @currYear
	and showInfo.onSales = "Y"
	) as t
;

select count(*) into @freeCount
from(
	select showInfo.onSales
	from artshow, showInfo
	where artshow.UID = showInfo.artshowUID
	and month(showInfo.time) = @currMonth
	and year(showInfo.time) = @currYear
	and showInfo.onSales = "N"
	) as t
;

insert into OnSale_info(OnSale_Y, OnSale_N) values(@notFreeCount, @freeCount);