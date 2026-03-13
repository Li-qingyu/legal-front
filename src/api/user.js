import request from "@/utils/request";

// 分页查询用户
export const queryPageApi = (username, currentPage, pageSize) => {
  return Promise.resolve({
    code: true,
    data: {
      rows: [
        {
          id: 1,
          username: 'admin',
          password: '123456',
          nickname: '管理员',
          email: 'admin@example.com',
          phone: '13800138000',
          role: 'admin',
          createTime: '2026-03-01 10:00:00'
        },
        {
          id: 2,
          username: 'user1',
          password: '123456',
          nickname: '用户1',
          email: 'user1@example.com',
          phone: '13800138001',
          role: 'user',
          createTime: '2026-03-02 10:00:00'
        },
        {
          id: 3,
          username: 'user2',
          password: '123456',
          nickname: '用户2',
          email: 'user2@example.com',
          phone: '13800138002',
          role: 'user',
          createTime: '2026-03-03 10:00:00'
        }
      ],
      total: 3
    }
  });
};

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
      role: 'admin'
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