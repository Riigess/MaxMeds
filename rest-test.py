from flask import Flask, request
from flask_cors import CORS
from markupsafe import escape

import json
import sqlite3 as sqlite
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/', methods=["GET", "POST"])
def home():
	conn = sqlite.connect('database.sqlite')
	cur = conn.cursor()

	if request.method == 'GET':
		cur.execute('SELECT * FROM MaxMeds WHERE med_name="Trazadone" ORDER BY timestamp DESC LIMIT 2;')
		resp = cur.fetchall()
		cur.execute('SELECT * FROM MaxMeds WHERE med_name="Gabapentin" ORDER BY timestamp DESC LIMIT 2;')
		resp += cur.fetchall()
		d_arr = []
		for r in resp:
			date_arr = [r[-1].split(' ')[0].split('-')[-1]]
			date_arr += r[-1].split(' ')[0].split('-')[:-1]
			date_arr += r[-1].split(' ')[1].split(':')
			date_arr = [int(i) for i in date_arr]
			d_arr.append(datetime(date_arr[0], date_arr[1], date_arr[2], date_arr[3], date_arr[4], date_arr[5]))
		return {'datetime':d_arr}
	elif request.method == 'POST':
		print('\tTime:', request.headers['timestamp'])
		print('\tDrug:', request.headers['medication'])
		t = request.headers['timestamp']
		date_arr = t.split(' ')[0].split('-')
		date_arr += t.split(' ')[1].split(':')
		date_arr = [int(i) for i in date_arr]
		date_arr[0] += 1
		print("[POST] Datetime:", date_arr)
		t = datetime(date_arr[2], date_arr[0], date_arr[1], date_arr[3], date_arr[4], date_arr[5])
		med = request.headers['medication']
		format_str = t.strftime("%m-%d-%Y %H:%M:%S")
		cur.execute(f"INSERT INTO MaxMeds(med_name, timestamp) VALUES('{med}', '{format_str}')")
		conn.commit()
		return 'OK'

app.run(debug=True)
