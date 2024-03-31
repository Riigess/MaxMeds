from flask import Flask, request, render_template
from flask_cors import CORS
from markupsafe import escape

import json
import sqlite3 as sqlite
from datetime import datetime
import subprocess
import os
import socket

import argparse

parser = argparse.ArgumentParser("MaxMeds")
parser.add_argument("--host-port", "--port", required=False, default=20080, help="Specifies what port to use for the server")
parser.add_argument("--wsgi-port", required=False, help="Specifies what port to give out to other devices (ex. what to replace the 5000 in <IP_ADDRESS>:5000 with)")

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
    # ip_addr = '192.168.15.39' #I don't like this, but it needs to get the host adapter's IP address...maybe I can just do a pass-through from Docker?
    ip_addr = ''
    if '10.0.1' in ipcon:
        ip_addr = ipcon[ipcon.index('10.0.1'):].split(' ')[0]
    elif '192.168.15' in ipcon:
        ip_addr = ipcon[ipcon.index('192.168.15'):].split(' ')[0]
    elif '172.22.0.' in ipcon:
        ip_addr = ipcon[ipcon.index('172.22.0.'):].split(' ')[0]
    print("IP ADDRESS:", ip_addr)
    return ip_addr

args = parser.parse_args().__dict__

#Get setup stuff for wsgi/application
ip_addr = get_ip_addr()
#application port data
int_port = int(args["host_port"]) if "host_port" in args else 20080
#wsgi port data
port = int_port
if "wsgi_port" in args:
    if type(args["wsgi_port"]) is not type(None):
        port = int(args["wsgi_port"])

def convert_timestamp(time:int):
    t = datetime.fromtimestamp(time/1000)
	# mdy = t.split(' ')[0].split('-')
	# new_timestamp = '-'.join([mdy[-1], mdy[0], mdy[1]]) + 'T' + t.split(' ')[1]
    new_timestamp = t.strftime("%Y-%m-%d %H:%M:%S")
    return new_timestamp

def get_medication(med_name:str, limit:int=-1):
    conn = sqlite.connect('database.sqlite')
    cur = conn.cursor()
    if limit != -1:
        cur.execute(f"SELECT * FROM MaxMeds WHERE med_name='{med_name}' ORDER BY timestamp DESC LIMIT {limit}")
    elif '%' in med_name and len(med_name) == 1:
        cur.execute("SELECT * FROM MaxMeds ORDER BY timestamp DESC")
    else:
        cur.execute(f"SELECT * FROM MaxMeds WHERE med_name='{med_name}' ORDER BY timestamp")
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
    if limit == 1:
        return json.dumps(to_ret[0])
    return json.dumps({"data":to_ret})

################################
#          GET ROOT            #
################################

@app.route('/', methods=['GET', 'POST'])
def index():
    conn = sqlite.connect('database.sqlite')
    cur = conn.cursor()

    if request.method == 'GET':
        return render_template('index.html').replace("<IP_ADDRESS>:5000", f"{ip_addr}:{port}")
    elif request.method == 'POST':
        print(request.headers)
        t = request.headers['timestamp']
        date_arr = t.split(' ')[0].split('-')
        date_arr += t.split(' ')[1].split(':')
        date_arr = [int(i) for i in date_arr]
        date_arr[0] += 1
        t = datetime(date_arr[2], date_arr[0], date_arr[1], date_arr[3], date_arr[4], date_arr[5])
        print("DATETIME: ", t)
        med = request.headers['medication']
        # format_str = t.strftime("%Y-%m-%d %H:%M:%S")
        format_str = t.timestamp() * 1000
        cur.execute(f"INSERT INTO MaxMeds(med_name, timestamp) VALUES('{med}', '{format_str}')")
        conn.commit()
        return 'OK'

@app.route('/history')
def history():
    return render_template('history.html').replace("<IP_ADDRESS>:5000", f"{ip_addr}:{port}")

################################
#      GET STATIC FILES        #
################################

@app.route('/index.css')
def index_css():
    f = open('static/index.css','r')
    d = f.read().replace(' ', '').replace('\t', '')
    f.close()
    return d

@app.route('/js-api.js')
def index_js():
    f = open('static/js-api.js','r')
    d = f.read().replace("http://<IP_ADDRESS>:5000", f"http://{ip_addr}:{port}")
    f.close()
    return d

@app.route('/history.js')
def history_js():
    f = open('static/history.js')
    d = f.read().replace("http://<IP_ADDRESS>:5000", f"http://{ip_addr}:{port}")
    f.close()
    return d

################################
#       GET MEDICATIONS        #
################################

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

################################
#         GET IMAGES           #
################################

@app.route('/static/images/<image_name>')
def get_image(image_name:str):
    if '.png' in image_name:
        print('listdir:', os.listdir('./static/images/'))
        if image_name in os.listdir('./static/images/'):
            f = open('static/images/' + image_name, 'rb')
            d = f.read()
            # print("Return data: ", d)
            f.close()
            return d
    return b''

################################
#           DELETE             #
################################

def delete_item(id:int):
    conn = sqlite.connect('database.sqlite')
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM MaxMeds WHERE id={id}")
    d = cur.fetchall()
    print(f"\t{id} data:", d)
    cur.execute(f"DELETE FROM MaxMeds WHERE id={id}")
    conn.commit()
    return {"code":200}

@app.route('/delete/<id>')
def delete_by_id(id:int):
    print(f"Queuing {id} for deletion")
    return delete_item(id)

if __name__ == "__main__":
    app.run(debug=True, host=ip_addr, port=int_port)
