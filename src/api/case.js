import request from "@/utils/request";

// 分页查询法律案例
export const queryPageApi = (name, typeId, tag, currentPage, pageSize) => {
  return request.get(`/admin/case?title=${name}&typeId=${typeId}&tag=${tag}&page=${currentPage}&pageSize=${pageSize}`);
    
};

// 用户端分页查询法律案例（只查询已发布的案例）
export const queryPageApiForUser = (name, typeId, tag, currentPage, pageSize) => {
  return request.get(`/admin/case?title=${name}&typeId=${typeId}&tag=${tag}&status=1&page=${currentPage}&pageSize=${pageSize}`);
    
};

// 根据ID查询法律案例
export const queryInfoApi = (id) => {
  return request.get(`/admin/case/${id}`);
};

//用户端根据ID查询法律案例
export const queryInfoApiForUser = (id) => {
  return request({
    url: `/user/case/${id}`,
    method: 'get'
  });
};

// 添加法律案例
export const addApi = (data) => {
  return request({
    url: '/admin/case',
    method: 'post',
    data
  });
};

// 更新法律案例
export const updateApi = (data) => {
  return request({
    url: '/admin/case',
    method: 'put',
    data
  });
};

// 删除法律案例
export const deleteApi = (id) => {
  return request({
    url: `/admin/case/${id}`,
    method: 'delete'
  });
};

// 批量切换案例状态
export const batchToggleStatusApi = (ids, status) => {
  return request({
    url: '/admin/case/batch-toggle-status',
    method: 'put',
    data: { ids, status }
  });
};

// 批量同步所有法律案例
export const batchSyncApi = () => {
  return request({
    url: '/admin/case/sync',
    method: 'post',
  });
};

//查询任务状态
export const queryTaskStatusApi = (taskId) => {
  return request({
    url: `/admin/case/sync/status`,
    method: 'get',
    params: { taskId }
  });
};