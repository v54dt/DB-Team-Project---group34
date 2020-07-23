
"""
Created on Sun Jul 19 13:09:03 2020
@author: 黃柏維

兩廳院售票 藝文活動爬蟲
https://www.artsticket.com.tw

"""

import requests
from bs4 import BeautifulSoup
import re
import mysql.connector
import MySQLdb

import datetime
import time

import queue
#from MySQLdb import IntegrityError

mydb = mysql.connector.connect(
  host="",
  user="",
  passwd="",
  database=""
)
mycursor = mydb.cursor()


#hostname ="https://www.artsticket.com.tw"
#route = "/CKSCC2005/Product/Product00/ProductsCategoriesPage.aspx"

title_categoryid = {
    "音樂":"8JNfZ4VZd5R%2b6AG8ujzh6g",
    "戲劇":"m40sIX3ugy6eaHqL9UKysQ",
    "舞蹈":"m40sIX3ugy6kVFzhRTmwIQ",
    "親子":"m40sIX3ugy4M%2fCZzGNHZ3Q",
    "電影":"m40sIX3ugy7qmsA9Hbstiw",
    "音樂劇":"m40sIX3ugy4F01Ea9HZaAw",
    "講座":"m40sIX3ugy6p%2bhcnSd3dCw",
    "活動":"m40sIX3ugy6GK1l%2fBnla9g",
    "商品":"m40sIX3ugy4XI0ifhLT54g",
    "其他":"8JNfZ4VZd5SyAa0ZIKNEB",
    }

categoryid = {
    "音樂":1,
    "戲劇":2,
    "舞蹈":3,
    "親子":4,
    "獨立音樂":5,
    "展覽":6,
    "講座":7,
    "電影":8,
    "綜藝":11,
    "競賽":13,
    "徵選":14,
    "其他":15,
    "演唱會":17
    }


def showinfo_time_regex(time_string):
    ts_re = re.compile('(\d{4})[/](\d{2})[/](\d{2})[(].[)](\d{2})[:](\d{2})')
    ts = ts_re.search(time_string)
    return ts.group(1)+"/"+ts.group(2)+"/"+ts.group(3)+" "+ts.group(4)+":"+ts.group(5)

def showInfo_location_regex(location_str):
    ls_re=re.compile('^(.+)[(【（](.*)[)】）]')
    ls = ls_re.search(location_str)
    
    if(ls == None):
        return {'locationName':location_str,'location':None}
    
    return {'locationName':ls.group(1),'location':ls.group(2)}

def check_schedule_time(soup):
    showInfo = soup.find('table',class_="programTable programTableOne")
    showInfoRow = showInfo.find_all('tr')
    #startDate = date_re.match(showInfoRow[0].td.text.split('\n',1)[0])
    #endDate = date_re.match(showInfoRow[len(showInfoRow)-1].td.text.split('\n',1)[0])
    
    startDate = re.search(r"(\d{4}\/\d{2}\/\d{2})",showInfoRow[0].td.text.split('\n',1)[0])
    endDate = re.search(r"(\d{4}\/\d{2}\/\d{2})",showInfoRow[len(showInfoRow)-1].td.text.split('\n',1)[0])

    return {"startDate":startDate.group(1),"endDate":endDate.group(1)}
def craw_info(sub_url):
    
    '''artshow'''
    resp = requests.get(sub_url)
    resp.encoding = 'utf-8' # encoded with format utf-8 for chinese character
    soup = BeautifulSoup(resp.text, 'lxml')
    
    '''UID'''
    UID = sub_url.split('ProductId=',1)[1]
    print(UID)
    '''title'''
    title = soup.find('div',class_="programTitle").text
    print(title.strip())
    '''showunit'''
    showUnit = soup.find('div',class_="programHost").text.strip()
    #print(showUnit)
    
    
    infoTxt = soup.find_all('div',class_="infoTxt")
    '''discountInfo'''
    discountInfo = infoTxt[2].text.strip()
    #print(discountInfo)
    '''descriptionFilterHtml'''
    descriptionFilterHtml = infoTxt[0].text.strip()
    #print(descriptionFilterHtml)
    #print(descriptionFilterHtml.text.strip())
    '''imageUrl'''
    imageUrl = soup.find('div',class_="programKvPic").img['src']
    #print(imageUrl)
    '''masterUnit'''
    masterUnit=""
    '''subUnit'''
    subUnit=""
    '''supportUnit'''
    supportUnit=""
    '''otherUnit'''
    otherUnit=""
    '''webSales'''
    webSales = sub_url
    #print(sub_url)
    '''sourceWebPromote'''
    sourceWebPromote = ""
    '''comment'''
    comment = infoTxt[3].span.get_text("\n")
    #print(comment)

    '''editModifyDate'''
    editModifyDate = "2020/07/22"
    '''sourceWebName'''
    sourceWebName = "兩廳院售票網"
    #print("兩廳院售票網")
    
    schedule_time = check_schedule_time(soup)
    startDate = schedule_time['startDate']
    endDate = schedule_time['endDate']
    '''startDate'''
    #print(startDate)
    '''endDate'''
    #print(endDate)
    
    '''hitRate'''
    hitRate = 0
    #describtionFilterHtml= soup.find('div',class_="infoTxt")
    #print(describtionFilterHtml.text.strip())
    

    
    try:
        mycursor.execute("INSERT INTO artshow "
                         "(UID,version,title,category,showUnit,discountInfo,descriptionFilterHtml,imageUrl,masterUnit,subUnit,supportUnit,otherUnit,webSales,sourceWebPromote,comment,editModifyDate,sourceWebName,startDate,endDate,hitRate)" 
                         "values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                         (UID,"1.0",title,category,showUnit,discountInfo,descriptionFilterHtml,imageUrl,masterUnit,subUnit,supportUnit,otherUnit,webSales,sourceWebPromote,comment,editModifyDate,sourceWebName,startDate,endDate,hitRate))
    except mysql.connector.IntegrityError:
        return
    
    
    '''showInfo'''
    showInfo = soup.find('table',class_="programTable programTableOne")
    showInforow = showInfo.find_all('tr')

    for i in showInforow:
        #print("=====================")
        td = i.find_all('td')
        '''artshowUID'''
        #print(UID)
        '''time'''
        showInfodate = showinfo_time_regex(td[0].text.strip().split('\n',1)[0])
        #print(showInfodate)
        
        location_dict = showInfo_location_regex(td[1].text.strip())
        '''location'''
        #print(location_dict['location'])
        '''locationName'''
        #print(location_dict['locationName'])
        '''onSales'''
        onSales = "Y"
        #print(onSales)
        '''price'''
        price = td[2].text.strip()
        #print(price)
        
        '''latitude'''
        latitude = None
        '''longitude'''
        longitude = None
        '''endTime'''
        endTime = ""
        #print(td[0].text.strip())
        
       
        showInfoTicketCount = td[0].text.strip().split('\n',1)[1]
        #print(showInfoTicketCount)
        
        
        mycursor.execute("INSERT INTO showInfo(artshowUID,`time`,location,locationName,onSales,price,latitude,longitude,endTime) "
                         "values (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                         (UID,showInfodate,location_dict['location'],location_dict['locationName'],onSales,price,latitude,longitude,endTime))
        

def get_categoryID(homepage,categoryID_queue):

    #url = "https://www.artsticket.com.tw/CKSCC2005/home/home00/index.aspx"
    resp = requests.get(homepage)
    resp.encoding = 'utf-8' # encoded with format utf-8 for chinese character
    soup = BeautifulSoup(resp.text, 'lxml')
    category = soup.find('div',class_="mainInnerRight")
    category_list = category.find_all('div',class_="block01Inner")

    for i in category_list:
        l = i.find_all(class_="listUl")
        for a in l:
            link = a.find_all('a')
            for href in link:

                link_re = re.compile('ProductsCategoryId=([^&]+)')
                categoryid = link_re.search(href['href'])

                if(categoryid != None):
                    #print(categoryid.group(1))
                    categoryID_queue.put(categoryid.group(1))

    
#craw_info("https://www.artsticket.com.tw/CKSCC2005/Product/Product00/ProductsDetailsPage.aspx?ProductId=rotyiUrPteTEAyabcdefa4EZabcdefabcdef")

def craw_info_url(category_url):
    resp = requests.get(url)
    resp.encoding = 'utf-8' # encoded with format utf-8 for chinese character
    soup = BeautifulSoup(resp.text, 'lxml')

    productlist = soup.find_all('div',class_="programContainer")



    for i in productlist:
   
        sub_productlist = i.find_all('div',class_="program programAll")
    
    
        for sub_list in sub_productlist:
            print("=============")
            title = sub_list.find('a',class_="programTitle").text
            link = hostname + sub_list.find('a',class_="programPic")['href']
        
            craw_info(link)

            print("=============")
            time.sleep(2)
    
    
#

'''       
url = hostname + route + "?ProductsCategoryId=" + title_categoryid['其他']
resp = requests.get(url)
resp.encoding = 'utf-8' # encoded with format utf-8 for chinese character
soup = BeautifulSoup(resp.text, 'lxml')

productlist = soup.find_all('div',class_="programContainer")



for i in productlist:
   
    sub_productlist = i.find_all('div',class_="program programAll")
    
    
    for sub_list in sub_productlist:
        print("=============")
        title = sub_list.find('a',class_="programTitle").text
        link = hostname + sub_list.find('a',class_="programPic")['href']
        
        craw_info(link)

        print("=============")
        time.sleep(2)
        
'''



#####
        
homepage = "https://www.artsticket.com.tw/CKSCC2005/Home/Home00/index.aspx"
hostname = "https://www.artsticket.com.tw"
route = "/CKSCC2005/Product/Product00/ProductsCategoriesPage.aspx"

categoryID_queue = queue.Queue()
get_categoryID(homepage,categoryID_queue)

while not categoryID_queue.empty():
    print("Start One Category")
    url = hostname + route + "?ProductsCategoryId=" + categoryID_queue.get()
    craw_info_url(url)
    print("A Categrory has Finished")
    


mydb.commit()
print(mycursor.rowcount, "record inserted.")
mycursor.close()
mydb.close()



#sub_url = "https://www.artsticket.com.tw/CKSCC2005/Product/Product00/ProductsDetailsPage.aspx?ProductId=rotyiUrPteQw%2fabcdefKeIhxqG"







#price = soup.find('td',class_="price_red").text
#print(price)

#場次


#print(detail_queue)

'''
import mysql.connector
import datetime
import time
import re
mydb = mysql.connector.connect(
  host="35.189.177.5",
  user="api",
  passwd="as7g8x7cerfgm",
  database="artcalendar"
)
mycursor = mydb.cursor()
'''
#tmp = time.strptime("2020/07/25(六)19:30", "%Y/%m/%d(六)%H:%M")
#print(tmp)
'''
ts = "2020/07/13(六)19:30"

ts_re = re.compile('^(\d{4})[/](\d{2})[/](\d{2})[(].[)](\d{2})[:](\d{2})')
m = ts_re.search(ts)

time_string = m.group(1)+"/"+m.group(2)+"/"+m.group(3)+" "+m.group(4)+":"+m.group(5)
print(time_string)
'''
#print (("%s-%02d-%02d %s") % (m[2], int(m[0]), int(m[1]), m[3]))

#newtmp = tmp.strftime("%Y/%m/%d %H:%M:%S")
#print(newtmp)


'''
time_string = "2020/07/13(六)19:30"

tup =(showinfo_time_regex(time_string),)

mycursor.execute("INSERT INTO showInfo (`time`) values (%s) ",tup)

mydb.commit()
print(mycursor.rowcount, "record inserted.")


mycursor.close()
mydb.close()

'''



'''
url = 'https://www.artsticket.com.tw/CKSCC2005/home/home00/index.aspx'
resp = requests.get(url)
resp.encoding = 'utf-8' # encoded with format utf-8 for chinese character
soup = BeautifulSoup(resp.text, 'lxml')
soup.prettify()
#print(soup.prettify())
#result = soup.find_all("div",class_="programContainer")

programs = soup.find_all('div',class_="program")

#print(programs[0])
for i in programs:
    print("=============")
    #print(programs[i].find('a',class_="programTitle").text)
    #print(programs[i].find('a',class_="programPic")['href'])
    #print(programs[0].find('img',class_="programPic")['src'])
    #print(programs[i].find('a',class_="programTime").text)
    
    try:
        print(i.find('a',class_="programTitle").text)
        print("https://www.artsticket.com.tw"+i.find('a',class_="programTitle")['href'])
        print(i.find('a',class_="programPic").img['src'])
        print(i.find('a',class_="programTime").text)
    except AttributeError:
        print("empty")
        
    print("=============")
    
'''