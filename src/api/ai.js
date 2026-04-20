import request from "@/utils/request";

// 发送消息获取AI回复
export const sendMessageApi = (data) => {
  return request.post('/ai/sendMessage', data);
};

// 获取历史对话列表
export const getHistoryApi = () => {
  return request.get('/ai/history');
};

// 保存对话
export const saveChatApi = (data) => {
  return request.post('/ai/saveChat', data);
};

// 上传文件
export const uploadFileApi = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/ai/uploadFile', formData);
};

// 创建新会话
export const createSessionApi = (sessionId) => {
  return request.post('/ai/createSession', { sessionId });
};

