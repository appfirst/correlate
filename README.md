# Correlate
A graphing application for AppFirst data. (An AppFirst account and API key is required.)

<img src="http://i.imgur.com/PeuNAoC.png" width="100%" />

#### Dependencies
Make sure you have these tools installed on your system:
- **Flask**, the Python web framework (`pip install flask`)
- **node.js** for building with r.js (https://nodejs.org/en/download/)
- **Bower** for installing external JavaScript libraries (`npm install -g bower`)

#### Installation
1. Clone or download & unzip this repository.
3. `cd` into `af_correlate` and run `bower install`. This will install all components listed in `bower.json` into the `lib/` directory.
4. Build all JavasSript components by running the command `sh static/buildjs.sh`. This will create a file called `main.built.js` in the `static/` directory.
5. Enter your appfirst username and API key into `settings.py`. (You can find your API key on your account page: https://pod3.appfirst.com/admin/account)
6. Start the local server by running `python server.py`