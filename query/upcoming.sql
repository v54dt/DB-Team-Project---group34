select *
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and artshow.startDate <= cast(curdate()+10 as date)
and artshow.startDate >= curdate()
;