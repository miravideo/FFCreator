'use strict';

// node-fetch from v3 is an ESM-only module - you are not able to import it with require().
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = fetch;