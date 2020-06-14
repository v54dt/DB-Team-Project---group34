#set @inputUID = "5a61d0a4c6355e2a94b8a0ac";
select *
from artshow, showInfo
where artshow.UID = showInfo.artshowUID
and artshow.UID = @inputUID
;