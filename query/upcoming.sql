select *
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and artshow.startDate <= date_add(curdate(),inteval 10 day)
and artshow.startDate >= curdate()
;