set @currMonth = month(curdate());
create table temp(
	category int not null,
	categoryCount int
);

insert into temp
select artshow.category as category,count(*) as categoryCount
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and month(showInfo.time) = @currMonth
group by artshow.category
;

select * from temp
into outfile '/var/lib/mysql-files/currMonthCountByCategory.csv'
fields terminated by ','
enclosed by '\"'
lines terminated by '\n';

drop table temp;