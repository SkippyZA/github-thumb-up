'use strict';

const rx = require('rx');
const R = require('ramda');
const bodyParser = require('body-parser');
const express = require('express');
const moment = require('moment');
const request = require('request');
const util = require('util');
const config = require('./config');

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));

// headers => github headers
const githubHeaders = R.pick(['x-github-event', 'x-github-delivery']);
// req => boolean
const isPullRequestEvent = R.compose(R.propEq('x-github-event', 'pull_request'), githubHeaders, R.prop('headers'));
// url, options => observable of post request response
const requestObservable = R.curry((url, config) => rx.Observable.fromNodeCallback(request.post)(url, config));
// Authorized request. @TODO: Clean this up
const authorizedRequest = (endpoint, body) => requestObservable(endpoint, {
  headers: {
    'User-Agent': 'github-thumbs-up',
    Authorization: R.concat('Basic ', new Buffer(config.GITHUB_BASIC_AUTH).toString('base64'))
  },
  json: body
});


// Do the magic
app.post('/github/events', (req, res) => {
  const requestStream = rx.Observable.just(req);

  const pullRequestStream = requestStream
    .filter(isPullRequestEvent)
    .map(R.path(['body', 'pull_request', 'statuses_url']))
    .flatMap(url => authorizedRequest(url, { state: 'pending' }))
    .doOnNext(console.log)
    .subscribe();

  res.send('OK!');
});

app.listen(config.PORT, () => {
  console.log('Express server listening on port ' + config.PORT);
});
