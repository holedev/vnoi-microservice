import http from "k6/http";
import { sleep } from "k6";

const _BASE_URL = "https://api-vnoi.undefine.tech/";

export const options = {
  cloud: {
    projectID: 3703661, // vnoi-mono
    name: "LOAD TESTING MONO"
  },
  vus: 100,
  duration: "30s"
};

export default function () {
  http.get(_BASE_URL);
  sleep(1);
}
