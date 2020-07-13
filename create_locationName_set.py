# -*- coding: utf-8 -*-
"""
Created on Thu Apr 30 17:40:49 2020

@author: v54dt
"""

import json 
import mysql.connector
import googlemaps


mydb = mysql.connector.connect(
  host="",
  user="root",
  passwd="",
  database="db_project"
)
mycursor = mydb.cursor()


gmaps = googlemaps.Client(key = "")


def checkdb(showInfo_locationName):
    sql = "select * from locationName_set where locationName like '" + showInfo_locationName + "';"
    #print(sql)
    mycursor.execute(sql)
    myresult = mycursor.fetchone()
    
    if(myresult):
        print("Found in DB")
        #print(myresult)
        return myresult
        #for x in myresult:
        #    print(x)
        #return True
    else:
        print("NOT IN DB")
        return None

    
def call_geocode_api(locationName):
    geocode_result = gmaps.geocode(locationName,None,None,"TW","zh-tw")
    return geocode_result




with open('./DB-Term-Project---group34/open_data/1.json',"r",encoding="utf-8") as json_file:
    data = json.load(json_file)


'''
i=0
for p in data:
  
  masterUnitStr = ','.join(data[i]['masterUnit'])
  subUnitStr = ','.join(data[i]['subUnit'])
  supportUnitStr = ','.join(data[i]['supportUnit'])
  otherUnitStr = ','.join(data[i]['otherUnit'])
  
  #mycursor.execute("INSERT INTO artshow (UID,version,title,category,showUnit,discountInfo,descriptionFilterHtml,imageUrl,masterUnit,subUnit,supportUnit,otherUnit,webSales,sourceWebPromote,comment,editModifyDate,sourceWebName,startDate,endDate,hitRate) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",(data[i]['UID'],data[i]['version'],data[i]['title'],data[i]['category'],data[i]['showUnit'],data[i]['discountInfo'],data[i]['descriptionFilterHtml'],data[i]['imageUrl'],masterUnitStr,subUnitStr,supportUnitStr,otherUnitStr,data[i]['webSales'],data[i]['sourceWebPromote'],data[i]['comment'],data[i]['editModifyDate'],data[i]['sourceWebName'],data[i]['startDate'],data[i]['endDate'],data[i]['hitRate']))
  print(i)
  i=i+1
  
  #for k in p.showInfo:
      

'''



i=0
for p in data:
    j=0
    for t in data[i]['showInfo']:
        
        #mycursor.execute("INSERT INTO showInfo(artshowUID,`time`,location,locationName,onSales,price,latitude,longitude,endTime) values (%s,%s,%s,%s,%s,%s,%s,%s,%s)",(data[i]['UID'],t['time'],t['location'],t['locationName'],t['onSales'],t['price'],t['latitude'],t['longitude'],t['endTime']))
        #checkdb(data[i]['showInfo']['locationName'])
        if(t['locationName']==''):
            continue
        stat = checkdb(t['locationName'])
        if(stat == None):
            print(t['locationName'])
            geocode_result = call_geocode_api(t['locationName'])
            #print(geocode_result)
            
            if geocode_result:
                print(geocode_result[0]['place_id'])
                print(t['locationName'])
                print(geocode_result[0]['formatted_address'])
                print(geocode_result[0]['geometry']['location']['lat'])
                print(geocode_result[0]['geometry']['location']['lng'])
                mycursor.execute("INSERT INTO locationName_set(`place_id`,`locationName`,`formatted_address`,`latitude`,`longitude`) values (%s,%s,%s,%s,%s)",(geocode_result[0]['place_id'],t['locationName'],geocode_result[0]['formatted_address'],geocode_result[0]['geometry']['location']['lat'],geocode_result[0]['geometry']['location']['lng']))
            else:
                mycursor.execute("INSERT INTO locationName_set(`locationName`) values (%s)",(t['locationName'],))
            
            db_result = geocode_result
            mydb.commit()

        else:
            db_result = stat
            # rewrite in showinfo data
        
        #rewrite db data
        
            
        
        j = j+1
    #print(i)
    i=i+1




#mydb.commit()
#print(mycursor.rowcount, "record inserted.")

'''
stat = checkdb("屏東演藝廳-音樂廳")

if(stat == None):
    print("it is not in db yet")
else:
    print("good")
#print(stat)
'''

#print(call_geocode_api("高雄市文化中心至德堂"))




mycursor.close()
mydb.close()
