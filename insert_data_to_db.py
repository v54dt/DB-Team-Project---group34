# -*- coding: utf-8 -*-
"""
Created on Thu Apr 30 17:40:49 2020

@author: 黃柏維
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
#print(data[0])

#sql = "INSERT INTO artshow (UID,version,title,category,showUnit,discountInfo text,descriptionFilterHtml,imageUrl,masterUnit,subUnit,supportUnit,otherUnit,webSales,sourceWebPromote,comment,editModifyDate,sourceWebName,startDate,endDate,hitRate) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
#val = (data[0]['UID'],data[0]['version'],data[0]['title'],data[0]['category'],data[0]['showUnit'],data[0]['discountInfo'],data[0]['descriptionFilterHtml'],data[0]['imageUrl'],data[0]['masterUnit'][0],data[0]['subUnit'],data[0]['supportUnit'],data[0]['otherUnit'],data[0]['webSales'],data[0]['sourceWebPromote'],data[0]['comment'],data[0]['editModifyDate'],data[0]['sourceWebName'],data[0]['startDate'],data[0]['endDate'],data[0]['hitRate'])
#mycursor.execute(sql, val)    
#mydb.commit()

#i=0
#for p in data:
  #print(data[i]['UID'])
  #mycursor.execute("INSERT INTO artshow (UID,version,title,category,showUnit,discountInfo text,descriptionFilterHtml,imageUrl,masterUnit,subUnit,supportUnit,otherUnit,webSales,sourceWebPromote,comment,editModifyDate,sourceWebName,startDate,endDate,hitRate) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",(data[i]['UID'],data[i]['version'],data[i]['title'],data[i]['category'],data[i]['showUnit'],data[i]['discountInfo'],data[i]['descriptionFilterHtml'],data[i]['imageUrl'],data[i]['masterUnit'][0],data[i]['subUnit'],data[i]['supportUnit'],data[i]['otherUnit'],data[i]['webSales'],data[i]['sourceWebPromote'],data[i]['comment'],data[i]['editModifyDate'],data[i]['sourceWebName'],data[i]['startDate'],data[i]['endDate'],data[i]['hitRate']))
  #i=i+1

i=0
for p in data:
  #mycursor.execute("INSERT INTO artshow (UID,version,category) values (%s, %s,%s)",(data[i]['UID'],data[i]['version'],data[i]['category']))
  masterUnitStr = ','.join(data[i]['masterUnit'])
  subUnitStr = ','.join(data[i]['subUnit'])
  supportUnitStr = ','.join(data[i]['supportUnit'])
  otherUnitStr = ','.join(data[i]['otherUnit'])
  #print(masterUnitStr)
  #print(subUnitStr)
  #print(supportUnitStr)
  #print(otherUnitStr)
  mycursor.execute("INSERT INTO artshow (UID,version,title,category,showUnit,discountInfo,descriptionFilterHtml,imageUrl,masterUnit,subUnit,supportUnit,otherUnit,webSales,sourceWebPromote,comment,editModifyDate,sourceWebName,startDate,endDate,hitRate) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",(data[i]['UID'],data[i]['version'],data[i]['title'],data[i]['category'],data[i]['showUnit'],data[i]['discountInfo'],data[i]['descriptionFilterHtml'],data[i]['imageUrl'],masterUnitStr,subUnitStr,supportUnitStr,otherUnitStr,data[i]['webSales'],data[i]['sourceWebPromote'],data[i]['comment'],data[i]['editModifyDate'],data[i]['sourceWebName'],data[i]['startDate'],data[i]['endDate'],data[i]['hitRate']))
  print(i)
  i=i+1

#for p in data:
#  mycursor.execute("INSERT INTO artshow values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",(p['UID'],p['version'],p['title'],p['category'],p['showUnit'],p['discountInfo'],p['descriptionFilterHtml'],p['imageUrl'],p['masterUnit'][0],p['subUnit'],p['supportUnit'],p['otherUnit'],p['webSales'],p['sourceWebPromote'],p['comment'],p['editModifyDate'],p['sourceWebName'],p['startDate'],p['endDate'],p['hitRate']))

i=0
for p in data:
    j=0
    for t in data[i]['showInfo']:
        #print(data[i]['UID'])
        mycursor.execute("INSERT INTO showInfo(artshowUID,`time`,location,locationName,onSales,price,latitude,longitude,endTime) values (%s,%s,%s,%s,%s,%s,%s,%s,%s)",(data[i]['UID'],t['time'],t['location'],t['locationName'],t['onSales'],t['price'],t['latitude'],t['longitude'],t['endTime']))
        j = j+1
    print(i)
    i=i+1

mydb.commit()
print(mycursor.rowcount, "record inserted.")

#print(data[0])

mycursor.close()
mydb.close()
