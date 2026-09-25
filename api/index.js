const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { app } = require('../backend/src/server');

module.exports = (req, res) => {
  return app(req, res);
};
