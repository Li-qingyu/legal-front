import request from "@/utils/request";

//收藏案例
export const collectCaseApi = (caseId) => {
  return request({
    url: '/user/collection',
    method: 'post',
    data: { caseId }
  });
};

//获取收藏列表
export const getCollectionListApi = () => {
  return request({
    url: '/user/collection',
    method: 'get'
  });
};

//取消收藏
export const cancelCollectionApi = (caseId) => {
  return request({
    url: `/user/collection/${caseId}`,
    method: 'delete'
  });
};
