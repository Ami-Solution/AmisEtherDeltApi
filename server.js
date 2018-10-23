const API = require('./amis-delta-dax.glitch.me/api.js');
const bodyParser = require('body-parser');
const async = require('async');
const fs = require('fs');
const sha256 = require('sha256');
const app = require('express')();
const http = require('http').Server(app);

let returnTickerData = { result: undefined };
let tradesData = { result: undefined };
const hashes = {};
let topOrders = [];
let ordersByPair = {};
const lookback = (86400 * 1) / 14;
const examinedEvents = {};
let eventsCache = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  // res.redirect('https://etherdelta.github.io');
  res.redirect('https://amis-delta-dax.glitch.me');
});

app.get('/returnTicker', (req, res) => {
  res.json(returnTickerData.result);
});

app.get('/events', (req, res) => {
  const result = { events: eventsCache, blockNumber: API.blockTimeSnapshot.blockNumber };
  res.json(result);
});

app.get('/events/:nonce', (req, res) => {
  const result = { events: eventsCache, blockNumber: API.blockTimeSnapshot.blockNumber };
  const eventsHash = sha256(JSON.stringify(result.events ? result.events : ''));
  const nonce = `events${req.params.nonce}`;
  if (hashes[nonce] !== eventsHash) {
    hashes[nonce] = eventsHash;
    res.json(result);
  } else {
    res.json(undefined);
  }
});

app.get('/events/:nonce/:since', (req, res) => {
  const since = req.params.since;
  const events = {};
  Object.keys(eventsCache).forEach((id) => {
    if (eventsCache[id].blockNumber >= since) {
      events[id] = eventsCache[id];
    }
  });
  const result = { events, blockNumber: API.blockTimeSnapshot.blockNumber };
  const eventsHash = sha256(JSON.stringify(result.events ? result.events : ''));
  const nonce = `eventsSince${req.params.nonce}`;
  if (hashes[nonce] !== eventsHash) {
    hashes[nonce] = eventsHash;
    res.json(result);
  } else {
    res.json(undefined);
  }
});

app.get('/trades', (req, res) => {
  res.json(tradesData.result);
});

app.get('/orders', (req, res) => {
  const result = { orders: API.ordersCache, blockNumber: API.blockTimeSnapshot.blockNumber };
  res.json(result);
});

app.get('/orders/:tokenA/:tokenB', (req, res) => {
  const { tokenA, tokenB } = req.params;
  const pair = `${tokenA}/${tokenB}`;
  if (!ordersByPair[pair]) {
    ordersByPair[pair] = API.getOrdersByPair(tokenA, tokenB, 100);
  }
  const result = { orders: ordersByPair[pair], blockNumber: API.blockTimeSnapshot.blockNumber };
  res.json(result);
});

app.get('/topOrders', (req, res) => {
  const result = { orders: topOrders, blockNumber: API.blockTimeSnapshot.blockNumber };
  res.json(result);
});

app.get('/topOrders/:nonce', (req, res) => {
  const result = { orders: topOrders, blockNumber: API.blockTimeSnapshot.blockNumber };
  const ordersHash = sha256(JSON.stringify(result.orders ? result.orders : ''));
  const nonce = `topOrders${req.params.nonce}`;
  if (hashes[nonce] !== ordersHash) {
    hashes[nonce] = ordersHash;
    res.json(result);
  } else {
    res.json(undefined);
  }
});

app.get('/orders/:nonce', (req, res) => {
  const result = { orders: API.ordersCache, blockNumber: API.blockTimeSnapshot.blockNumber };
  const ordersHash = sha256(JSON.stringify(result.orders ? result.orders : ''));
  const nonce = `orders${req.params.nonce}`;
  if (hashes[nonce] !== ordersHash) {
    hashes[nonce] = ordersHash;
    res.json(result);
  } else {
    res.json(undefined);
  }
});

app.get('/orders/:nonce/:tokenA/:tokenB', (req, res) => {
  const { tokenA, tokenB } = req.params;
  const nonce = `ordersPair${req.params.nonce}`;
  const pair = `${tokenA}/${tokenB}`;
  if (!ordersByPair[pair]) {
    ordersByPair[pair] = API.getOrdersByPair(tokenA, tokenB, 100);
  }
  const result = { orders: ordersByPair[pair], blockNumber: API.blockTimeSnapshot.blockNumber };
  const ordersHash = sha256(JSON.stringify(result.orders ? result.orders : ''));
  if (hashes[nonce] !== ordersHash) {
    hashes[nonce] = ordersHash;
    res.json(result);
  } else {
    res.json(undefined);
  }
});

app.post('/message', (req, res) => {
  try {
    const message = JSON.parse(req.body.message);
    API.addOrderFromMessage(message, (err) => {
      if (!err) {
        res.json('success');
      } else {
        res.json('failure');
      }
    });
  } catch (err) {
    res.json('failure');
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500);
  res.json({ error: 'An error occurred.' });
});

function updateOrders() {
  // refresh stale orders
  async.forever(
    (next) => {
      API.getBlockNumber((errBlockNumber, blockNumber) => {
        if (!errBlockNumber && blockNumber && blockNumber > 0) {
          // remove expired orders
          let expiredRemoves = 0;
          Object.keys(API.ordersCache).forEach((id) => {
            const order = API.ordersCache[id];
            const expires = order.order.expires;
            if (blockNumber > expires) {
              delete API.ordersCache[id];
              expiredRemoves += 1;
            }
          });

          // remove cancelled orders
          let cancelRemoves = 0;
          Object.keys(API.eventsCache).forEach((id) => {
            const event = API.eventsCache[id];
            if (event.event === 'Cancel' && !examinedEvents[`${id}-${event.id}`]) {
              examinedEvents[`${id}-${event.id}`] = true;
              const removes = Object.keys(API.ordersCache).filter((x) => {
                const order = API.ordersCache[x];
                return order.order.r === event.args.r &&
                order.order.s === event.args.s &&
                Number(order.order.v) === Number(event.args.v);
              });
              removes.forEach((remove) => {
                delete API.eventsCache[remove];
                cancelRemoves += 1;
              });
            }
          });

          const idsAll = Object.keys(API.ordersCache);
          const ids = {};

          // find events
          const eventOrdersToUpdate = [];
          Object.keys(API.eventsCache).forEach((id) => {
            const event = API.eventsCache[id];
            if (!examinedEvents[`${id}-${event.id}`]) {
              if (event.event === 'Deposit' || event.event === 'Withdraw') {
                Object.keys(API.ordersCache).forEach((x) => {
                  const order = API.ordersCache[x];
                  if (order.order.user === event.args.user) {
                    eventOrdersToUpdate.push({ id: x, examinedEventsId: `${id}-${event.id}` });
                  }
                });
              } else if (event.event === 'Trade') {
                Object.keys(API.ordersCache).forEach((x) => {
                  const order = API.ordersCache[x];
                  if (order.order.user === event.args.get || order.order.user === event.args.give) {
                    eventOrdersToUpdate.push({ id: x, examinedEventsId: `${id}-${event.id}` });
                  }
                });
              }
            }
          });

          const buys = {};
          const sells = {};
          const pairs = {};
          const topN = 5;
          const topOrdersToUpdate = [];
          Object.keys(API.ordersCache).forEach((id) => {
            const order = API.ordersCache[id];
            if (order.amount > 0) {
              if (!buys[`${order.order.tokenGet}/${order.order.tokenGive}`]) buys[`${order.order.tokenGet}/${order.order.tokenGive}`] = [];
              buys[`${order.order.tokenGet}/${order.order.tokenGive}`].push({ order, id });
              pairs[`${order.order.tokenGet}/${order.order.tokenGive}`] = true;
            } else if (order.amount < 0) {
              if (!sells[`${order.order.tokenGive}/${order.order.tokenGet}`]) sells[`${order.order.tokenGive}/${order.order.tokenGet}`] = [];
              sells[`${order.order.tokenGive}/${order.order.tokenGet}`].push({ order, id });
              pairs[`${order.order.tokenGive}/${order.order.tokenGet}`] = true;
            }
          });
          Object.keys(pairs).forEach((pair) => {
            const buyOrders = buys[pair] || [];
            const sellOrders = sells[pair] || [];
            sellOrders.sort((a, b) => a.order.price - b.order.price || a.order.id - b.order.id);
            buyOrders.sort((a, b) => b.order.price - a.order.price || a.order.id - b.order.id);
            buyOrders.slice(0, topN).forEach((order) => {
              topOrdersToUpdate.push(order.id);
            });
            sellOrders.slice(0, topN).forEach((order) => {
              topOrdersToUpdate.push(order.id);
            });
          });

          idsAll.sort(
            (a, b) =>
              new Date(API.ordersCache[a].updated) - new Date(API.ordersCache[b].updated));
          idsAll.slice(0, 100).forEach((id) => {
            ids[id] = true;
          });
          // shuffle(topOrdersToUpdate).slice(0, 250).forEach((id) => {
          topOrdersToUpdate.forEach((id) => {
            if (new Date() - new Date(API.ordersCache[id].updated) > 5 * 60 * 1000) {
              ids[id] = true;
            }
          });
          eventOrdersToUpdate.slice(0, 250).forEach((x) => {
            ids[x.id] = true;
            examinedEvents[x.examinedEventsId] = true;
          });

          console.log(new Date(), 'All order ids', idsAll.length);
          console.log(new Date(), 'Removals (expired)', expiredRemoves);
          console.log(new Date(), 'Removals (cancelled)', cancelRemoves);
          console.log(new Date(), 'Ids to update via events', eventOrdersToUpdate.length);
          console.log(new Date(), 'Ids to update because top of order book', topOrdersToUpdate.length);
          console.log(new Date(), 'Ids to update in this cycle', Object.keys(ids).length);
          async.eachSeries(
            Object.keys(ids),
            (id, callbackEach) => {
              if (API.ordersCache[id]) {
                API.updateOrder(API.ordersCache[id], (err) => {
                  if (err) delete API.ordersCache[id];
                  callbackEach(null);
                });
              } else {
                callbackEach(null);
              }
            },
            () => {
              API.saveOrders(() => {
                setTimeout(() => {
                  next();
                }, 1 * 1000);
              });
            });
        } else {
          setTimeout(() => {
            next();
          }, 1 * 1000);
        }
      });
    },
    (err) => {
      console.log('Update order loop failed: ', err);
    });
}

function updateData() {
  API.getBlockNumber((errBlockNumber, blockNumber) => {
    API.logs((errLogs) => {
      if (!errLogs && !errBlockNumber) {
        // delete old events
        Object.keys(API.eventsCache).forEach((key) => {
          if (API.eventsCache[key].blockNumber < blockNumber - lookback) {
            delete API.eventsCache[key];
          }
        });
        const eventsCacheFiltered = {};
        Object.keys(API.eventsCache).sort((a, b) =>
          API.eventsCache[b].blockNumber - API.eventsCache[a].blockNumber ||
          API.eventsCache[b].logIndex - API.eventsCache[a].logIndex)
        .slice(0, 1000)
        .forEach((id) => {
          eventsCacheFiltered[id] = API.eventsCache[id];
        });
        eventsCache = eventsCacheFiltered;
        async.parallel(
          [
            (callback) => {
              API.getTrades((err, result) => {
                if (!err) {
                  const now = new Date();
                  const trades = result.trades
                    .map((x) => {
                      if (x.token && x.base && x.base.name === 'ETH') {
                        if (x.amount > 0) {
                          return {
                            pair: `${x.token.name}-${x.base.name}`,
                            rate: x.price,
                            amount: API.utility.weiToEth(x.amount, API.getDivisor(x.token)),
                            type: 'buy',
                            date: API.blockTime(x.blockNumber),
                          };
                        }
                        return {
                          token: `${x.token.name}-${x.base.name}`,
                          rate: x.price,
                          amount: API.utility.weiToEth(-x.amount, API.getDivisor(x.token)),
                          type: 'sell',
                          date: API.blockTime(x.blockNumber),
                        };
                      }
                      return undefined;
                    })
                    .filter(x => x && now - x.date < 86400 * 10 * 1000);
                  trades.sort((a, b) => b.date - a.date);
                  tradesData = { updated: Date.now(), result: trades };
                }
                callback(null, undefined);
              });
            },
            (callback) => {
              API.returnTicker((err, result) => {
                if (!err) {
                  returnTickerData = { updated: Date.now(), result };
                }
                callback(null, undefined);
              });
            },
          ],
          () => {
            topOrders = API.getTopOrders();
            ordersByPair = {};
            setTimeout(updateData, 10 * 1000);
          });
      } else {
        setTimeout(updateData, 10 * 1000);
      }
    }, lookback);
  });
}

fs.readFile('provider', { encoding: 'utf8' }, (err, data) => {
  const provider = data;
  const configName = process.argv.length > 2 ? process.argv[2] : undefined;
  API.init(
    () => {
      updateOrders();
      updateData();
      const port = process.env.PORT || 3000;
      http.listen(port, () => {
        console.log(`listening on port ${port}`);
      });
    },
    false,
    './etherdelta.github.io/',
    provider, configName, lookback);
});
