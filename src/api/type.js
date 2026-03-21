import request from "@/utils/request";

// 查询所有法律类型
export const queryAllApi = () => {
  return request.get('/admin/types/list');
};

// 根据ID查询法律类型
export const queryIdApi = (id) => {
  return request.get(`/admin/types/${id}`);
};

// 添加法律类型
export const addApi = (data) => {
  return Promise.resolve({
    code: true,
    msg: '添加成功'
  });
};

// 更新法律类型
export const updateApi = (data) => {
  return Promise.resolve({
    code: true,
    msg: '更新成功'
  });
};

// 删除法律类型
export const deleteIdApi = (id) => {
  return Promise.resolve({
    code: true,
    msg: '删除成功'
  });
};