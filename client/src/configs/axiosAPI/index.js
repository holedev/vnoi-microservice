import axios from 'axios';
import { getAuth } from 'firebase/auth';
import '~/configs/firebase';

const SERVER_CONTEXT = '/api';

const endpoints = {
  users: `${SERVER_CONTEXT}/user`,
  classes: `${SERVER_CONTEXT}/common/classes`,
  problems: `${SERVER_CONTEXT}/exercise/problems`,
  submissions: `${SERVER_CONTEXT}/exercise/submissions`,
  videos: `${SERVER_CONTEXT}/media/videos`,
  files: `${SERVER_CONTEXT}/media/files`,
};

// axios

const getFirebaseToken = async () => {
  const currentUser = getAuth().currentUser;
  if (currentUser) return currentUser.getIdToken();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(null);
    }, 10000);

    const unregisterAuthObserver = getAuth().onAuthStateChanged(
      async (user) => {
        if (!user) reject(null);
        const token = await user.getIdToken();
        resolve(token);
        unregisterAuthObserver();
        clearTimeout(timer);
      }
    );
  });
};

const axiosAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosAPI.interceptors.request.use(async (config) => {
  const token = await getFirebaseToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    import.meta.env.VITE_MODE === 'development' && console.log(error.message);
    return Promise.reject(error);
  }
);

export default axiosAPI;
export { endpoints };
