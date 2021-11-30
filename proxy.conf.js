const PROXY_CONFIG = [
  {
    context: [
      "/api"
    ],
    // target: "http://192.168.1.126:3000",
    target: "http://10.10.111.82:3200",
    secure: false
  }
];
module.exports = PROXY_CONFIG;
