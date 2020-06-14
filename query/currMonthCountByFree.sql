set @currMonth = month(curdate());
set @currYear = year(curdate());
create table temp(
	onSales text not null,
	eventCount int
);

insert into temp
select showInfo.onSales as onSales,count(*) as eventCount
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and month(showInfo.time) = @currMonth
and year(showInfo.time) = @currYear
group by showInfo.onSales
;

select * from temp
into outfile '/var/lib/mysql-files/currMonthCountByFree.csv'
fields terminated by ','
enclosed by '"'
lines terminated by '\n';

drop table temp;