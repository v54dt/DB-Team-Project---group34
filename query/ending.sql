select *
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and artshow.endDate <= date_add(curdate(),inteval 10 day)
and artshow.endDate >= curdate()
;