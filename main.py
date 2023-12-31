from flask import Flask, request, render_template
from flask_cors import CORS
from markupsafe import escape

import json
import sqlite3 as sqlite
from datetime import datetime
import subprocess
import os
import socket

app = Flask(__name__)
CORS(app)

#Get device IP Address
def get_ip_addr():
    ipcon = ''
    if 'Darwin' in os.uname().sysname:
        ipcon = str(subprocess.run('ifconfig', capture_output=True).stdout)[2:-1]
    else:
        ipcon = str(subprocess.run('/usr/sbin/ifconfig', capture_output=True).stdout)[2:-1]
    ipcon = ipcon.replace("\\r", "").replace("\\n", "\n").replace("\n\n\n", "\n").replace("\n\n", "\n")
    # ip_addr = ipcon[ipcon.index('IPv4 Address'):ipcon.index('Subnet')].split(": ")[1].split("\n")[0]
    ip_addr = ''
    if '10.0.1' in ipcon:
        ip_addr = ipcon[ipcon.index('10.0.1'):].split(' ')[0]
    elif '192.168.15' in ipcon:
        ip_addr = ipcon[ipcon.index('192.168.15'):].split(' ')[0]
    return ip_addr

def convert_timestamp(t:str):
	mdy = t.split(' ')[0].split('-')
	new_timestamp = '-'.join([mdy[-1], mdy[0], mdy[1]]) + 'T' + t.split(' ')[1]
	return new_timestamp

def get_medication(med_name:str, limit:int=-1):
    conn = sqlite.connect('database.sqlite')
    cur = conn.cursor()
    if limit != -1:
        cur.execute(f"SELECT * FROM MaxMeds WHERE med_name='{med_name}' ORDER BY timestamp DESC LIMIT {limit}")
    elif '%' in med_name and len(med_name) == 1:
        cur.execute("SELECT * FROM MaxMeds ORDER BY timestamp DESC")
    else:
        cur.execute(f"SELECT * FROM MaxMeds WHERE med_name='{med_name}' ORDER BY timestamp DESC")
    headers = [i[0] for i in cur.description]
    resp = cur.fetchall()
    if limit == -1:
        limit = len(resp)
    to_ret = []
    for i in range(limit):
        dict = {}
        for j in range(len(headers)):
            dict.update({headers[j]:resp[i][j]})
        dict['timestamp'] = convert_timestamp(dict['timestamp'])
        to_ret.append(dict)
    print("To Return:", to_ret)
    #TODO: Create above dict to handle an array of dictionary responses from the SQLite table..
    if limit == 1:
        return json.dumps(to_ret[0])
    return json.dumps({"data":to_ret})

@app.route('/', methods=['GET', 'POST'])
def index():
    conn = sqlite.connect('database.sqlite')
    cur = conn.cursor()

    if request.method == 'GET':
        return render_template('index.html')
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

@app.route('/history')
def history():
    return render_template('history.html')

@app.route('/index.css')
def index_css():
    f = open('static/index.css','r')
    d = f.read().replace(' ', '').replace('\t', '')
    f.close()
    return d

@app.route('/js-api.js')
def index_js():
    f = open('static/js-api.js','r')
    d = f.read().replace("http://<IP_ADDRESS>:5000", f"http://{get_ip_addr()}:20080")
    f.close()
    return d

@app.route('/history.js')
def history_js():
    f = open('static/history.js')
    d = f.read().replace("http://<IP_ADDRESS>:5000", f"http://{get_ip_addr()}:20080")
    f.close()
    return d

@app.route('/all/<med_name>')
def get_all_med(med_name:str):
    return get_medication(med_name)

@app.route('/all')
def get_all():
    return get_medication('%')

@app.route('/trazadone')
def trazadone():
    return get_medication('Trazadone', 2)

@app.route('/gabapentin')
def gabapentin():
    return get_medication('Gabapentin', 1)

if __name__ == "__main__":
    app.run(debug=True, host=f'{get_ip_addr()}', port=20080)
