select *
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and artshow.endDate <= cast(curdate()+10 as date)
and artshow.endDate >= curdate()
;