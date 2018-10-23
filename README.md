# Cache

## Installation

 * `apt-get update`
 * `apt-get -y install software-properties-common curl build-essential nload vnstat python`
 * `apt-get -y install git nginx`
 * `apt-get -y install build-essential libssl-dev`
 * `curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -o install_nvm.sh`
 * `bash install_nvm.sh`
 * `nvm install 8.1.0`
 * `npm install -g pm2`
 * Copy docker/config/nginx.conf into /etc/nginx/nginx.conf
 * Copy docker/sites-enabled/default_cache into /etc/nginx/sites-enabled/default
 * Copy SSL certificates (fullcert.pem and privkey.pem) into /certs

## Git

 * `cd ~ && git clone --recursive https://github.com/ami-solution/AmisEtherDeltApi.git`
 * `cd ~/AmisEtherDeltApi && npm install`
 * To update: `sh pull.sh` and `npm install`

## Start

 * `cd ~ && pm2 start cache.js`

## Monitor

 * `pm2 list`, `pm2 log`

# API-main

## Installation

 * `wget http://d1h4xl4cr1h0mo.cloudfront.net/v1.6.8/x86_64-unknown-linux-gnu/parity_1.6.8_amd64.deb`
 * `dpkg -i parity_1.6.8_amd64.deb`
 * `apt-get update`
 * `apt-get -y install software-properties-common curl build-essential nload vnstat python`
 * `apt-get -y install git nginx`
 * `apt-get -y install build-essential libssl-dev`
 * `curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -o install_nvm.sh`
 * `bash install_nvm.sh`
 * `nvm install 8.1.0`
 * `npm install -g pm2`
 * Copy docker/config/nginx.conf into /etc/nginx/nginx.conf
 * Copy docker/sites-enabled/default into /etc/nginx/sites-enabled/default
 * Copy SSL certificates (fullcert.pem and privkey.pem) into /certs

## Git

 * `cd ~ && git clone --recursive https://github.com/etherdelta/AmisEtherDeltApi.git`
 * `cd ~/AmisEtherDeltApi && npm install`
 * `cd ~/AmisEtherDeltApi/amis-delta-dax.glitch.me && npm install`
 * `cd ~/AmisEtherDeltApi/amis-delta-dax.glitch.me/common && npm install`
 * To update: `sh pull.sh` and `npm install`

## Start

 * `parity daemon ~/parity.pid`
 * `cd ~ && pm2 start server.js`

## Monitor

 * `pm2 list`, `pm2 log`
