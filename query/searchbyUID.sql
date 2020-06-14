#set input UID like this
#set @inputUID = "5eaf1626d083a33abc1aaddf"

select *
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and artshow.UID = @inputUID
;