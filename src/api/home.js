import request from "@/utils/request";

// 获取轮播图数据
export const getCarouselApi = () => {
  return request.get('/home/carousel');
};

// 获取热门法律案例
export const getHotCasesApi = (page = 1, pageSize = 3) => {
  return request.get(`/home/cases?page=${page}&pageSize=${pageSize}`);
};

// 获取法律条文
export const getLawsApi = (page = 1, pageSize = 4) => {
  return request.get(`/home/laws?page=${page}&pageSize=${pageSize}`);
};

// 搜索法律相关内容
export const searchLawContentApi = (keyword, type = 'all', page = 1, pageSize = 10) => {
  return request.get(`/home/search?keyword=${keyword}&type=${type}&page=${page}&pageSize=${pageSize}`);
};

// AI法律咨询
export const aiConsultApi = (question) => {
  return request({
    url: '/home/ai-consult',
    method: 'post',
    data: { question }
  });
};
