import { app, PORT } from "./index.js";
import exitHook from "async-exit-hook";

app.listen(PORT, () => {
  console.log(`---> SERVICE AUTH is running on port ${PORT} <---`);
});

exitHook(() => {
  console.log(`---> SERVICE AUTH ${PORT} is shutting down ... <---`);
});
