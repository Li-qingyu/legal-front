import axios from 'axios'
// 暂时注释掉Element Plus和router的导入，项目初步构建阶段可能还未集成
// import { ElMessage } from 'element-plus';
// import router from '../router'

//创建axios实例对象
const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 600000
})

//axios的请求 request 拦截器-获取localStorage中的token在请求头中增加token请求头
request.interceptors.request.use(
  (config) => { //成功回调
    //在请求头中增加token
    // 暂时注释掉token逻辑，项目初步构建阶段可能还未实现登录功能
    // const loginUser=JSON.parse(localStorage.getItem('loginUser'));
    // if (loginUser&&loginUser.token) {
    //   config.headers.token = loginUser.token;
    // }
    return config
  },
  (error) => { //失败回调
    return Promise.reject(error)
  }
)

//axios的响应 response 拦截器
request.interceptors.response.use(
  (response) => { //成功回调
    return response.data
  },
  (error) => { //失败回调
    // 暂时注释掉错误处理逻辑，项目初步构建阶段可能还未集成相关功能
    // if(error.response.status===401){
    //   //提示信息
    //   ElMessage.error('请重新登陆！');
    //   //跳转登陆页面
    //   router.push('/login');
    // }
    return Promise.reject(error)
  }
)

export default request