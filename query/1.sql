set @inputStartDate = '2020-01-01';
set @inputEndDate = '2020-12-31';

select * 
from artshow
where artshow.startDate <= @inputEndDate
and artshow.endDate >= @inputStartDate