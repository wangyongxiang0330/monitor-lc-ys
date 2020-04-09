import axios from 'axios';
import qs from 'qs'
let base = 'https://openapi.lechange.cn:443/openapi';
let baseApi = 'https://open.ys7.com/api';

export const getOpenapiData = (url, params) => { return axios.post(`${base}/${url}`, params); };

export const postApiData = (url, params) => { return axios.post(`${baseApi}/${url}`, qs.stringify(params)); };

