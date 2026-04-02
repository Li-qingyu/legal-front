# 管理端首页接口文档

## 1. 接口概览

| 接口名称 | URL | 方法 | 功能描述 |
|---------|-----|------|----------|
| 首页统计数据 | /admin/dashboard/stats | GET | 获取首页统计数据 |
| 最近活动列表 | /admin/dashboard/activities | GET | 获取最近系统活动 |
| 案例数量统计 | /admin/cases/count | GET | 获取案例总数 |
| 类型数量统计 | /admin/types/count | GET | 获取法律类型总数 |
| 条文数量统计 | /admin/articles/count | GET | 获取法律条文总数 |
| 用户数量统计 | /admin/users/count | GET | 获取用户总数 |

## 2. 详细接口说明

### 2.1 首页统计数据接口

**接口地址**：`/admin/dashboard/stats`

**请求方法**：`GET`

**请求参数**：无

**响应格式**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "cases": {
      "count": 156,
      "trend": 12.5
    },
    "types": {
      "count": 24,
      "trend": 5.2
    },
    "articles": {
      "count": 892,
      "trend": 8.3
    },
    "users": {
      "count": 328,
      "trend": 15.8
    }
  }
}
```

**字段说明**：
- `cases.count`：案例总数
- `cases.trend`：案例数量增长趋势（百分比）
- `types.count`：法律类型总数
- `types.trend`：法律类型数量增长趋势（百分比）
- `articles.count`：法律条文总数
- `articles.trend`：法律条文数量增长趋势（百分比）
- `users.count`：用户总数
- `users.trend`：用户数量增长趋势（百分比）

### 2.2 最近活动列表接口

**接口地址**：`/admin/dashboard/activities`

**请求方法**：`GET`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| limit | number | 否 | 限制返回数量，默认10 |
| offset | number | 否 | 偏移量，默认0 |

**响应格式**：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "type": "case",
      "title": "新增法律案例：劳动合同纠纷案例",
      "time": "2026-04-02 10:30:45",
      "icon": "📚",
      "user": "admin"
    },
    {
      "id": 2,
      "type": "user",
      "title": "新用户注册：张三",
      "time": "2026-04-02 10:15:22",
      "icon": "👤",
      "user": "system"
    },
    {
      "id": 3,
      "type": "update",
      "title": "更新法律条文：民法典第123条",
      "time": "2026-04-02 09:45:18",
      "icon": "📝",
      "user": "admin"
    }
  ]
}
```

**字段说明**：
- `id`：活动ID
- `type`：活动类型（case、user、update、collection等）
- `title`：活动标题
- `time`：活动时间
- `icon`：活动图标
- `user`：操作用户

### 2.3 案例数量统计接口

**接口地址**：`/admin/cases/count`

**请求方法**：`GET`

**请求参数**：无

**响应格式**：

```json
{
  "code": 200,
  "msg": "success",
  "data": 156
}
```

### 2.4 类型数量统计接口

**接口地址**：`/admin/types/count`

**请求方法**：`GET`

**请求参数**：无

**响应格式**：

```json
{
  "code": 200,
  "msg": "success",
  "data": 24
}
```

### 2.5 条文数量统计接口

**接口地址**：`/admin/articles/count`

**请求方法**：`GET`

**请求参数**：无

**响应格式**：

```json
{
  "code": 200,
  "msg": "success",
  "data": 892
}
```

### 2.6 用户数量统计接口

**接口地址**：`/admin/users/count`

**请求方法**：`GET`

**请求参数**：无

**响应格式**：

```json
{
  "code": 200,
  "msg": "success",
  "data": 328
}
```

## 3. 错误响应格式

```json
{
  "code": 400,
  "msg": "请求参数错误"
}

{
  "code": 401,
  "msg": "未授权访问"
}

{
  "code": 500,
  "msg": "服务器内部错误"
}
```

## 4. 接口调用示例

### 4.1 获取首页统计数据

```javascript
// 前端调用示例
async function loadStats() {
  try {
    const response = await fetch('/admin/dashboard/stats');
    if (response.ok) {
      const data = await response.json();
      console.log('统计数据:', data.data);
      return data.data;
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
}
```

### 4.2 获取最近活动

```javascript
// 前端调用示例
async function loadActivities() {
  try {
    const response = await fetch('/admin/dashboard/activities?limit=5');
    if (response.ok) {
      const data = await response.json();
      console.log('最近活动:', data.data);
      return data.data;
    }
  } catch (error) {
    console.error('加载活动数据失败:', error);
  }
}
```

## 5. 后端实现建议

### 5.1 数据模型设计

**活动记录表 (activity_logs)**
| 字段名 | 数据类型 | 描述 |
|--------|----------|------|
| id | int | 主键 |
| type | varchar | 活动类型 |
| title | varchar | 活动标题 |
| user_id | int | 操作用户ID |
| created_at | datetime | 创建时间 |
| ip_address | varchar | 操作IP |

### 5.2 实现逻辑

1. **统计数据接口**：
   - 查询各表的记录总数
   - 计算与上一周期的增长趋势
   - 整合数据返回

2. **活动记录接口**：
   - 记录系统关键操作（案例新增、用户注册、条文更新等）
   - 按时间倒序返回最近的活动记录
   - 支持分页查询

3. **权限控制**：
   - 所有接口需要管理员权限
   - 实现JWT token验证

## 6. 性能优化建议

1. **缓存机制**：统计数据可以缓存5-10分钟，减少数据库查询
2. **索引优化**：为活动表的created_at字段添加索引
3. **批量查询**：一次性查询所有统计数据，减少数据库连接次数
4. **异步处理**：活动记录可以异步写入，不影响主业务流程

## 7. 安全注意事项

1. **SQL注入防护**：使用参数化查询
2. **XSS防护**：对活动标题等用户输入进行过滤
3. **接口限流**：防止恶意请求导致服务器负载过高
4. **数据验证**：对请求参数进行严格验证

## 8. 版本管理

| 版本 | 日期 | 描述 |
|------|------|------|
| v1.0 | 2026-04-02 | 初始版本 |
| v1.1 | 2026-04-10 | 增加活动记录详情接口 |
| v1.2 | 2026-04-20 | 优化统计数据缓存机制 |