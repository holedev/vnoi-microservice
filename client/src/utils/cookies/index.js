import Cookies from "universal-cookie";

const cookies = new Cookies(null, {
    path: "/",
});

export { cookies };
