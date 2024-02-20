import { app, PORT } from "./index.js";
import exitHook from "async-exit-hook";

app.listen(PORT, () => {
  console.log(`---> Gateway is running on port ${PORT} <---`);
});

exitHook(() => {
  console.log(`---> Gateway ${PORT} is shutting down ... <---`);
});
