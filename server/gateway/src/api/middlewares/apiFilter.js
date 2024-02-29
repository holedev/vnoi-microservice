const apiFilter = async (req, res, next) => {
  if (req.path.startsWith("/api")) {
    req.url = req.url.replace(/^\/api/, "");
  }
  next();
};

export { apiFilter };
