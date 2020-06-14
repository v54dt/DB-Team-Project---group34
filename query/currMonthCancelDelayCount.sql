set @currMonth = month(curdate());
set @currYear = year(curdate());

truncate table postponed_cancelled_info;

select count(*) into @cancel_cnt
from (
	select title
	from artshow, showInfo
	where artshow.UID = showInfo.artshowUID
	and instr(artshow.title, "取消" collate utf8mb4_unicode_ci)
	and month(showInfo.time) = @currMonth
	and year(showInfo.time) = @currYear
	) as t
;

select count(*) into @delay_cnt
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

insert into postponed_cancelled_info(postponed, cancelled) values (@cancel_cnt,@delay_cnt)
