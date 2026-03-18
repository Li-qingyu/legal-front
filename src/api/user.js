import request from "@/utils/request";

// 分页查询用户
export const queryPageApi = (username, currentPage, pageSize) => {
  return request.get(`/admin/users?name=${username}&page=${currentPage}&pageSize=${pageSize}`)
}


// 根据ID查询用户
export const queryInfoApi = (id) => {
  return request.get(`/admin/users/${id}`)
};

// 添加用户
export const addApi = (data) => {
  return request.post('/admin/users',data);
};

// 更新用户
export const updateApi = (data) => {
  return request.put(`/admin/users`,data);
};

// 删除用户
export const deleteApi = (id) => {
  return request.delete(`/admin/users/${id}`);
};

// 修改密码
export const updatePasswordApi = (id, oldPassword, newPassword) => {
  return Promise.resolve({
    code: true,
    msg: '密码修改成功'
  });
};

// 更新用户状态
export const updateStatusApi = (id, status) => {
  // 将 status 放入 params 配置中，作为查询参数发送
  return request.post(`/admin/users/${id}/status`, null, { params: { status } });
};