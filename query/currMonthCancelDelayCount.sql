set @currMonth = month(curdate());
set @currYear = year(curdate());


select count(*) into @cnt
from (
	select title
	from artshow, showInfo
	where artshow.UID = showInfo.artshowUID
	and instr(artshow.title, "取消" collate utf8mb4_unicode_ci)
	and month(showInfo.time) = @currMonth
	and year(showInfo.time) = @currYear
	) as t
;

set @o = concat('"', "取消" collate utf8mb4_unicode_ci, '"', '"', @cnt, '"\n');

select count(*) into @cnt
from (
	select title
	from artshow, showInfo
	where artshow.UID = showInfo.artshowUID
	and (  instr(artshow.title, "延後" collate utf8mb4_unicode_ci)
		or instr(artshow.title, "延期" collate utf8mb4_unicode_ci))
	and month(showInfo.time) = @currMonth
	and year(showInfo.time) = @currYear
	) as t
;

set @o = concat(@o,'"', "延期" collate utf8mb4_unicode_ci, '"', '"', @cnt, '"\n');

select @o into dumpfile '/var/lib/mysql-files/currMonthCancelDelayCount.csv';