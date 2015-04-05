import pymongo

con = pymongo.Connection(host='127.0.0.1', port=3002)
print con.database_names()