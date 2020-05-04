# -*- coding: utf-8 -*-
"""
Created on Thu Apr 30 17:40:49 2020

@author: v54dt
"""

import json

import mysql.connector

mydb = mysql.connector.connect(
  host="35.170.90.76",
  user="root",
  passwd="",
  database="db_project"
)
mycursor = mydb.cursor()


with open('19.json',"r",encoding="utf-8") as json_file:
    data = json.load(json_file)


i=0
for p in data:
  masterUnitStr = ','.join(data[i]['masterUnit'])
  subUnitStr = ','.join(data[i]['subUnit'])
  supportUnitStr = ','.join(data[i]['supportUnit'])
  otherUnitStr = ','.join(data[i]['otherUnit'])
  
  mycursor.execute("INSERT INTO artshow (UID,version,title,category,showUnit,discountInfo,descriptionFilterHtml,imageUrl,masterUnit,subUnit,supportUnit,otherUnit,webSales,sourceWebPromote,comment,editModifyDate,sourceWebName,startDate,endDate,hitRate) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",(data[i]['UID'],data[i]['version'],data[i]['title'],data[i]['category'],data[i]['showUnit'],data[i]['discountInfo'],data[i]['descriptionFilterHtml'],data[i]['imageUrl'],masterUnitStr,subUnitStr,supportUnitStr,otherUnitStr,data[i]['webSales'],data[i]['sourceWebPromote'],data[i]['comment'],data[i]['editModifyDate'],data[i]['sourceWebName'],data[i]['startDate'],data[i]['endDate'],data[i]['hitRate']))
  print(i)
  i=i+1


i=0
for p in data:
    j=0
    for t in data[i]['showInfo']:
        
        mycursor.execute("INSERT INTO showInfo(artshowUID,`time`,location,locationName,onSales,price,latitude,longitude,endTime) values (%s,%s,%s,%s,%s,%s,%s,%s,%s)",(data[i]['UID'],t['time'],t['location'],t['locationName'],t['onSales'],t['price'],t['latitude'],t['longitude'],t['endTime']))
        j = j+1
    print(i)
    i=i+1

mydb.commit()
print(mycursor.rowcount, "record inserted.")



mycursor.close()
mydb.close()
