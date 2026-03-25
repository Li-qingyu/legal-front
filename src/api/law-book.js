import request from "@/utils/request";

// 分页查询法律书
export const queryPageApi = (name, currentPage, pageSize) => {
  return request.get(`/admin/law-books?name=${name}&page=${currentPage}&pageSize=${pageSize}`);
};

// 根据ID查询法律书
export const queryInfoApi = (id) => {
  return request.get(`/admin/law-books/${id}`);
};

// 添加法律书
export const addApi = (data) => {
  return request({
    url: '/admin/law-books',
    method: 'post',
    data
  });
};

// 更新法律书
export const updateApi = (data) => {
  return request({
    url: '/admin/law-books',
    method: 'put',
    data
  });
};

// 删除法律书
export const deleteApi = (ids) => {
  return request({
    url: `/admin/law-books/${ids}`,
    method: 'delete'
  });
};

// 获取所有法律书列表
export const getAllLawBooksApi = () => {
  return request.get('/admin/law-books/all');
};