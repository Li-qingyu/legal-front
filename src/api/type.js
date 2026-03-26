import request from "@/utils/request";

// 查询所有法律类型
export const queryAllApi1 = () => {
  return request.get('/admin/types/all');
};

// 查询所有法律类型有参
export const queryAllApi = (name) => {
  return request.get('/admin/types/list', {params: {name}});
};

// 根据ID查询法律类型
export const queryIdApi = (id) => {
  return request.get(`/admin/types/${id}`);
};

// 添加法律类型
export const addApi = (data) => {
  return request.post('/admin/types', data);
};

// 更新法律类型
export const updateApi = (data) => {
  return request.put('/admin/types', data);
};

// 删除法律类型
export const deleteIdApi = (id) => {
  return request.delete(`/admin/types/${id}`);
};