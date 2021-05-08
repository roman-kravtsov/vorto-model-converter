const axios = require("axios");
const api = axios.create({
  baseURL: "https://vorto.eclipseprojects.io/api/v1/models",
  timeout: 35000,
});

module.exports = api;
