import { _SERVICE } from "../env/index.js";

// gateway accessible
const _HOST = "http://localhost:";

const _PROXY_CONFIG = [
  {
    path: _SERVICE.COMMON_SERVICE.PATH,
    target: _HOST + _SERVICE.COMMON_SERVICE.PORT
  },
  {
    path: _SERVICE.USER_SERVICE.PATH,
    target: _HOST + _SERVICE.USER_SERVICE.PORT
  },
  {
    path: _SERVICE.EXERCISE_SERVICE.PATH,
    target: _HOST + _SERVICE.EXERCISE_SERVICE.PORT
  },
  {
    path: _SERVICE.MEDIA_SERVICE.PATH,
    target: _HOST + _SERVICE.MEDIA_SERVICE.PORT
  },
  {
    path: _SERVICE.LEARNING_SERVICE.PATH,
    target: _HOST + _SERVICE.LEARNING_SERVICE.PORT
  },
  {
    path: _SERVICE.STATISTICS_SERVICE.PATH,
    target: _HOST + _SERVICE.STATISTICS_SERVICE.PORT
  }
];

export { _PROXY_CONFIG };
