import { getApiUrl, setApiUrl, getAuth, setAuth } from "../utils/config.util.js";

const url = {
  set(url) {
    setApiUrl(url);
    console.log(`API URL set to: ${url}`);
  },
  get() {
    console.log(getApiUrl());
  }
};

const authconfig = {
  set(authtoken) {
    setAuth(authtoken);
    console.log(`Auth Token set to: ${authtoken}`);
  },
  get() {
    console.log(getAuth());
  }
};

export { url, authconfig };
