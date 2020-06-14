call getNextMonth();
select *
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and showInfo.time > curdate()
and showInfo.time < date_add(curdate(), inteval 30 day)
;