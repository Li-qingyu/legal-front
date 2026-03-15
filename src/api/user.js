import request from "@/utils/request";

// 分页查询用户
export const queryPageApi = (username, currentPage, pageSize) => {
  return request.get(`/admin/users?name=${username}&page=${currentPage}&pageSize=${pageSize}`)
}


// 根据ID查询用户
export const queryInfoApi = (id) => {
  return Promise.resolve({
    code: true,
    data: {
      id: id,
      username: 'admin',
      password: '123456',
      nickname: '管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      role: 1
    }
  });
};

// 添加用户
export const addApi = (data) => {
  return Promise.resolve({
    code: true,
    msg: '添加成功'
  });
};

// 更新用户
export const updateApi = (data) => {
  return Promise.resolve({
    code: true,
    msg: '更新成功'
  });
};

// 删除用户
export const deleteApi = (id) => {
  return Promise.resolve({
    code: true,
    msg: '删除成功'
  });
};

// 修改密码
export const updatePasswordApi = (id, oldPassword, newPassword) => {
  return Promise.resolve({
    code: true,
    msg: '密码修改成功'
  });
};