const axios = require("axios");
const api = axios.create({
  baseURL: "https://vorto.eclipse.org/api/v1/models/",
  timeout: 35000,
});

module.exports = api;
