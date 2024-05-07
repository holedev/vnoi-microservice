import { _RESPONSE_SERVICE } from "../../../configs/env/index.js";

// Format data response service to service

const FormatData = {
  success: (data) => {
    return {
      code: _RESPONSE_SERVICE.SUCCESS,
      message: data
    };
  },
  warning: (data) => {
    return {
      code: _RESPONSE_SERVICE.WARNING,
      message: data
    };
  },
  error: (data) => {
    return {
      code: _RESPONSE_SERVICE.ERROR,
      message: data
    };
  }
};

export { FormatData };
