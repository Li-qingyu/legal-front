import request from "@/utils/request";


//登录
export const loginApi=(data)=>{
  return request.post('/login',data);
}

//注册
export const registerApi=(data)=>{
  return request.post('/register',data);
}

//发送邮箱验证码
export const sendEmailCodeApi=(email)=>{
  return request.post('/sendEmailCode',{email});
}