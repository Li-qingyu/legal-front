import request from "@/utils/request";

// 查询所有法律类型
export const queryAllApi = () => {
  return Promise.resolve({
    code: true,
    data: [
      { id: 1, name: '民事法律', description: '涉及公民之间的权利义务关系', updateTime: '2026-03-12 10:00:00' },
      { id: 2, name: '刑事法律', description: '涉及犯罪和刑罚的法律', updateTime: '2026-03-12 10:00:00' },
      { id: 3, name: '行政法律', description: '涉及行政机关和公民之间的关系', updateTime: '2026-03-12 10:00:00' }
    ]
  });
};

// 根据ID查询法律类型
export const queryIdApi = (id) => {
  return Promise.resolve({
    code: true,
    data: {
      id: id,
      name: '民事法律',
      description: '涉及公民之间的权利义务关系'
    }
  });
};

// 添加法律类型
export const addApi = (data) => {
  return Promise.resolve({
    code: true,
    msg: '添加成功'
  });
};

// 更新法律类型
export const updateApi = (data) => {
  return Promise.resolve({
    code: true,
    msg: '更新成功'
  });
};

// 删除法律类型
export const deleteIdApi = (id) => {
  return Promise.resolve({
    code: true,
    msg: '删除成功'
  });
};