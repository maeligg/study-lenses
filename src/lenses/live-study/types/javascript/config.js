
const staticConfig = require('../static/config.js');

const config = {
  "eval": false,
  "loopGuard": [
    false,
    {
      "active": true,
      "max": 0
    }
  ],
  "clearScheduled": false,
  "openIn": [
    "jsTutor",
    "jsTutorLive",
    "loupe",
    "promisees",
    "esprima",
    "babel"
  ],
  "tests": false,
  "dependencies": [],
  // "aran": false,
};

module.exports = Object.assign({}, config, staticConfig);