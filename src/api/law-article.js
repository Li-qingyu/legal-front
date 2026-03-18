import request from '@/utils/request'

// 分页查询法律条文
export const queryPageApi = (bookTitle, articleTitle, currentPage, pageSize) => {
  return request({
    url: '/admin/law-articles',
    method: 'get',
    params: {
      bookTitle,
      articleTitle,
      page: currentPage,
      pageSize
    }
  })
}

// 新增法律条文
export const addApi = (data) => {
  return request({
    url: '/admin/law-articles',
    method: 'post',
    data
  })
}

// 查询法律条文详情
export const queryInfoApi = (id) => {
  return request({
    url: `/admin/law-articles/${id}`,
    method: 'get'
  })
}

// 修改法律条文
export const updateApi = (data) => {
  return request({
    url: `/admin/law-articles/${data.id}`,
    method: 'put',
    data
  })
}

// 删除法律条文
export const deleteApi = (ids) => {
  return request({
    url: `/admin/law-articles/${ids}`,
    method: 'delete'
  })
}

// 批量导入法律条文
export const importApi = (data) => {
  return request({
    url: '/admin/law-articles/import',
    method: 'post',
    data
  })
}