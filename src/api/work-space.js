import request from "@/utils/request";

// 获取法律案例数量
export const getCaseCountApi = () => {
  return request.get('/admin/case/count');
};

// 获取法律类型数量
export const getTypeCountApi = () => {
  return request.get('/admin/types/count');
};

// 获取法律条文数量
export const getArticleCountApi = () => {
  return request.get('/admin/law-articles/count');
};

// 获取用户数量
export const getUserCountApi = () => {
  return request.get('/admin/users/count');
};

export const getTrendDataApi=()=>{
  return request.get('/admin/work-space/trend');
}

// 获取最近活动
export const getRecentActivitiesApi = () => {
  return request.get('/admin/dashboard/activities');
};