set @currMonth = month(curdate());

select artshow.category as category,count(*) as categoryCount
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and month(showInfo.time) = @currMonth
group by artshow.category
;