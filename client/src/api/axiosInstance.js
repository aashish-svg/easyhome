import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://easyhome-j0dc.onrender.com/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosInstance;