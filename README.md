<img align="left" src="https://raw.githubusercontent.com/amisolution/ERC20-AMIS/master/amis-logo3.png" alt="amis-logo3"/>
<img align="right" src="https://raw.githubusercontent.com/amisolution/ERC20-AMIS/master/images/AMIS-QRCODE.png" alt="AMIS-QRCODE" width="100"/>

[![Website Down](https://img.shields.io/badge/website-down-red.svg)](http://erc20-amis.amisolution.net/)&nbsp;
[![Join the Gitchat at https://gitter.im/amis-delta-dex/Lobby](https://badges.gitter.im/amis-delta-dex/Lobby.svg)](https://gitter.im/AMIS-DELTA-DEX/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)&nbsp;[![Trade Bounty](https://img.shields.io/badge/trade-bounty-orange.svg)](https://github.com/amisolution/ERC20-AMIS/issues/)&nbsp;[![Twitter AirDrop](https://img.shields.io/badge/Twitter-Airdrop-red.svg)](https://twitter.com/AMIStoken_ERC20)&nbsp;[![Official Twitter](https://img.shields.io/badge/official-twitter-brightgreen.svg)](https://twitter.com/amis_erc20)&nbsp;[![Official AmisForkdelta](https://img.shields.io/badge/official-forkdelta-brightgreen.svg)](https://forkdelta.app/#!/trade/0x949bed886c739f1a3273629b3320db0c5024c719-ETH)
&nbsp;[![Official AmisEtherDelta](https://img.shields.io/badge/official-etherdelta-brightgreen.svg)](https://etherdelta.com/#0x949bed886c739f1a3273629b3320db0c5024c719-ETH)
&nbsp;[![Official BambooRelay](https://img.shields.io/badge/official-bamboorelay-brightgreen.svg)](https://bamboorelay.com/trade/AMIS-WETH)&nbsp;[![Official AmisTokenJar](https://img.shields.io/badge/official-tokenjar-brightgreen.svg)](https://tokenjar.io/amis)
&nbsp;[![ßtesting Dubiex](https://img.shields.io/badge/ßtesting-dubiex-yellow.svg)](https://dubiex.com/AMIS/ETH)&nbsp;[![Official AmisLedgerDex](https://img.shields.io/badge/official-ledgerdex-1330e3.svg)](https://app.ledgerdex.com/#/app/orders/maker-taker/AMIS/0x949bed886c739f1a3273629b3320db0c5024c719/WETH/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
)&nbsp;[![Official Cryptoderivatives](https://img.shields.io/badge/official-cryptoderivatives-4330e7.svg)](https://cryptoderivatives.market/token/AMIS)&nbsp;[![Official Cryptocompare](https://img.shields.io/badge/official-cryptocompare-brightgreen.svg)](https://www.cryptocompare.com/coins/amis)&nbsp;[![Official DexTracker](https://img.shields.io/badge/official-dextracker-brightgreen.svg)](https://etherscan.io/dextracker?filter=&q=AMIS)
&nbsp;[![ßtesting TokenStore](https://img.shields.io/badge/ßtesting-TokenStore-yellow.svg)](https://token.store/trade/0x949bed886c739f1a3273629b3320db0c5024c719)
&nbsp;[![αtesting EthenMarket](https://img.shields.io/badge/αtesting-ethenmarket-lightgrey.svg)](https://ethen.market/949bed886c739f1a3273629b3320db0c5024c719)&nbsp;[![ßtesting AmisDex](https://img.shields.io/badge/ßtesting-amisdex-lightblue.svg)](https://amisdex.github.io/amis-exchange-www)

[![CircleCI](https://circleci.com/gh/Ami-Solution/AmisEtherDeltApi/tree/glitch.svg?style=svg)](https://circleci.com/gh/Ami-Solution/AmisEtherDeltApi/tree/glitch)

# AmisEtherDeltApi

## What is AmisEtherDeltApi ?

AmisEtherDeltApi is an experimental project which consist of building an API for Amis Ether Delta. 

### HLA
The High Level Architecture is depicted in below diagram:
                                                                    
	                                                                     
	                                                                     
	                       ┌─────────────────────────────┐                       
	                       │   amis-delta-dax.glitch.me  │
			                     │            Amis             │
	                       │   	    Delta Dax	Client     │
			                     │    	     Front-End    	     │                       
	                       │              		             │                       
	                       └─────────────────────────────┘                       
	                                    ▲  ▲                             
	                            ┌───────┘  └───────┐                     
	                            │                  ▼                     
	                     ┌─────────────┐    ┌─────────────┐              
	                     │             │    │             │              
	                     │     Cache   │    │  MAIN API   │              
	                     │    server   │    │             │              
	                     └─────────────┘    └─────────────┘              
	                            ▲                  ▲                     
	                            │ emits            │                     
	                            └─events┐   ┌──────┘                     
	                                    │   │                            
	                                    │   ▼                            
	    ┌──────────────────┐    ┌─────────────────┐       ┌──────────────┐
	    │  Relevant EVM    │    │                 │       │◦◦◦◦◦◦◦◦◦◦◦◦◦◦│
	    │   event streams  │────▶AmisEtherDeltApi │◀─────▶│◦◦◦◦◦◦◦◦◦◦◦◦◦◦│
	    │                  │    │                 │       │◦◦◦◦◦◦◦◦◦◦◦◦◦◦│
	    └──────────────────┘    └─────────────────┘       └──────────────┘
	                                      ▲                              
	                                      │                              
	                                      ▼                              
	                              ┌──────────────┐                       
	                              │              │                       
	                              │  Orderbook   │                       
	                              │              │                       
	                              └──────────────┘                       
	                                      ▲                              
	                                      │                              
	                                      ▼                              
	                              ┌──────────────┐                       
	                              │              │                       
	                              │  Data store  │                       
	                              │              │                       
	                              └──────────────┘                       

# Cache server 

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

# API-main server

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

 * `cd ~ && git clone --recursive https://github.com/ami-solution/AmisEtherDeltApi.git`
 * `cd ~/AmisEtherDeltApi && npm install`
 * `cd ~/AmisEtherDeltApi/amis-delta-dax.glitch.me && npm install`
 * `cd ~/AmisEtherDeltApi/amis-delta-dax.glitch.me/common && npm install`
 * To update: `sh pull.sh` and `npm install`

## Start

 * `parity daemon ~/parity.pid`
 * `cd ~ && pm2 start server.js`

## Monitor

 * `pm2 list`, `pm2 log`
 
# * Project maintained by ["Ami-Solution"](https://github.com/ami-solution)
