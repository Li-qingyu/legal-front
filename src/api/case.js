import request from "@/utils/request";

// 分页查询法律案例
export const queryPageApi = (name, typeId, tag, currentPage, pageSize) => {
  return Promise.resolve({
    code: true,
    data: {
      rows: [
        {
          id: 1,
          title: '劳动合同纠纷案例',
          typeId: 1,
          typeName: '民事法律',
          tags: '劳动合同,纠纷',
          content: '王某与某公司因劳动合同解除产生纠纷，最终通过法律途径维护了自身权益。',
          cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=legal%20case%20labor%20contract&image_size=square',
          publishTime: '2026-03-01 10:00:00',
          status: 1
        },
        {
          id: 2,
          title: '房产继承纠纷案例',
          typeId: 1,
          typeName: '民事法律',
          tags: '房产,继承',
          content: '李某与兄弟姐妹因房产继承问题产生争议，通过调解达成一致意见。',
          cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=legal%20case%20property%20inheritance&image_size=square',
          publishTime: '2026-02-28 10:00:00',
          status: 1
        },
        {
          id: 3,
          title: '交通事故赔偿案例',
          typeId: 1,
          typeName: '民事法律',
          tags: '交通事故,赔偿',
          content: '张某因交通事故受伤，通过法律途径获得了合理的赔偿。',
          cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=legal%20case%20traffic%20accident&image_size=square',
          publishTime: '2026-02-25 10:00:00',
          status: 0
        }
      ],
      total: 3
    }
  });
};

// 根据ID查询法律案例
export const queryInfoApi = (id) => {
  return Promise.resolve({
    code: true,
    data: {
      id: id,
      title: '劳动合同纠纷案例',
      typeId: 1,
      tags: '劳动合同,纠纷',
      content: '王某与某公司因劳动合同解除产生纠纷，最终通过法律途径维护了自身权益。',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=legal%20case%20labor%20contract&image_size=square',
      status: 1
    }
  });
};

// 添加法律案例
export const addApi = (data) => {
  return Promise.resolve({
    code: true,
    msg: '添加成功'
  });
};

// 更新法律案例
export const updateApi = (data) => {
  return Promise.resolve({
    code: true,
    msg: '更新成功'
  });
};

// 删除法律案例
export const deleteApi = (id) => {
  return Promise.resolve({
    code: true,
    msg: '删除成功'
  });
};