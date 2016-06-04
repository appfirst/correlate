from flask import Flask, render_template, request
from settings import *
import requests, json
from requests.auth import HTTPBasicAuth

app = Flask(__name__)

auth = HTTPBasicAuth(API_USERNAME, API_KEY)
headers = {'accept': 'application/json;'}

@app.route("/api/<path:path>")
def api(path):
	url = '{0}/{1}'.format(BASE_URL, path)
	req = requests.get(url, auth=auth, headers=headers, params=request.args)
	return json.dumps(req.json())

@app.route("/")
@app.route("/<path:path>")
def hello(path=None):
	return render_template('correlate.html')


if __name__ == "__main__":
	app.run()