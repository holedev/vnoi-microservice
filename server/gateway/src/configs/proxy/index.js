const _PROXY_CONFIG = [
  {
    path: "/auth",
    target: "http://localhost:8001"
  },
  {
    path: "/user",
    target: "http://localhost:8010"
  },
  {
    path: "/compiler",
    target: "http://localhost:8020"
  },
  {
    path: "/video",
    target: "http://localhost:8030"
  }
];

export { _PROXY_CONFIG };
