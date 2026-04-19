<script setup>
import { onMounted, ref, watch } from 'vue'
import { queryPageApi , addApi, queryInfoApi, updateApi, deleteApi} from '@/api/law-book'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete, Edit, Document } from '@element-plus/icons-vue'

//搜索表单对象
let searchStu = ref({name: ''}) 
//列表展示数据
let tableData = ref([])

//钩子函数 - 页面加载时触发
onMounted(() => {
  queryPage()
})

//监听搜索条件变化，当搜索条件变为空时自动更新页面数据
watch(searchStu, (newVal, oldVal) => {
  if ((!newVal.name || newVal.name === '') && 
      (oldVal.name)) {
    queryPage()
  }
}, { deep: true })

//复选框
let selectIds = ref([])
const handleSelectionChange = (selection) => {
  selectIds.value = selection.map(item => item.id)
}

//分页组件
const pagination = ref({currentPage: 1, pageSize: 10, total: 0})
//每页展示记录数发生变化时触发
const handleSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize
  queryPage()
}
//当前页码发生变化时触发
const handleCurrentChange = (page) => {
  pagination.value.currentPage = page
  queryPage()
}

//分页条件查询
const queryPage = async () => {
  const result = await queryPageApi(
      searchStu.value.name,
      pagination.value.currentPage,
      pagination.value.pageSize
  );

  if(result.code) {
    // 为每条数据添加自增ID
    tableData.value = (result.data.rows || result.data.records || []).map((item, index) => ({
      ...item,
      autoId: (pagination.value.currentPage - 1) * pagination.value.pageSize + index + 1
    }))
    pagination.value.total = result.data.total
  }
}

//清空搜索栏
const clear = () => {
  searchStu.value = {name: ''}
  queryPage()
}

//----------- 新增 / 修改 ---------------------------
let dialogFormVisible = ref(false) //控制新增/修改的对话框的显示与隐藏
let labelWidth = ref(120) //form表单label的宽度
let formTitle = ref('') //表单的标题
let stu = ref({ //法律书对象-表单数据绑定
  id: '',
  name: '',
  publishDate: '',
  effectiveDate: ''
})

//清空表单
const clearStu = () => {
  stu.value = {
    id: '',
    name: '',
    publishDate: '',
    effectiveDate: ''
  }
}

//新增法律书
const addStu = () => {
  dialogFormVisible.value = true
  formTitle.value = '新增法律书'
  clearStu()
}

//修改法律书
const updateStu = async (id) => {
  clearStu()
  dialogFormVisible.value = true
  formTitle.value = '修改法律书'
  let result = await queryInfoApi(id)
  if(result.code){
    const data = result.data;
    stu.value = {
      ...data,
      publishDate: data.publishDate ? data.publishDate.substring(0, 10) : '',
      effectiveDate: data.effectiveDate ? data.effectiveDate.substring(0, 10) : ''
    };
  }
}

//表单校验规则
const stuFormRef = ref()
const rules = ref({
  name: [
    { required: true, message: '法律书名称为必填项', trigger: 'blur' },
    { min: 2, max: 200, message: '法律书名称长度为2-200个字', trigger: 'blur' }
  ],
  publishDate: [
    { required: true, message: '发布日期为必填项', trigger: 'blur' }
  ],
  effectiveDate: [
    { required: true, message: '生效日期为必填项', trigger: 'blur' }
  ]
})

//重置表单
const resetForm = (stuForm) => {
  if (!stuForm) return
  stuForm.resetFields()
}

//-------------保存法律书信息 
const save = (stuForm) => {
  //表单校验
  if(!stuForm) return
  stuForm.validate(async (valid) => {
    if(valid) {
      let api 
      if(stu.value.id) {
        api = updateApi(stu.value)
      }else {
        api = addApi(stu.value)
      }
      
      let result = await api
      if(result.code) {
        ElMessage.success('操作成功')
        dialogFormVisible.value = false
        queryPage()
      }else {
        ElMessage.error(result.msg)
      }
    }else {
      return false
    }
  })
}


//------- 删除法律书
//删除法律书（支持单个删除和批量删除）
const deleteLawBook = async (ids) => {
  // 如果传入的是单个ID，转换为数组
  const deleteIds = Array.isArray(ids) ? ids : [ids]
  
  if (deleteIds.length === 0) {
    ElMessage.warning('请选择要删除的法律书')
    return
  }
  
  const confirmMessage = deleteIds.length === 1 ? '您确认删除此法律书吗?' : '您确认删除选中的法律书吗?'
  const confirmTitle = deleteIds.length === 1 ? '删除法律书' : '批量删除'
  
  ElMessageBox.confirm(confirmMessage, confirmTitle, {confirmButtonText:'确认', cancelButtonText:'取消', type:'warning'})
    .then(async () => {
      let result = await deleteApi(deleteIds.join(','))
      if(result.code) {
        ElMessage.success('删除成功')
        queryPage()
      }else {
        ElMessage.error(result.msg)
      }
    }).catch(() => {
      ElMessage.info('取消删除')
    })
}

//根据ID删除单个法律书
const delById = async (id) => {
  await deleteLawBook(id)
}

//批量删除法律书
const delByIds = async () => {
  await deleteLawBook(selectIds.value)
}
</script>

<template>
  <div class="law-book-management">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="header-text">
            <h1 class="page-title">法律书管理</h1>
            <p class="page-subtitle">Law Book Management</p>
          </div>
        </div>
        <div class="header-right">
          <el-button type="success" size="large" @click="addStu();resetForm(stuFormRef)">
            <el-icon><Plus /></el-icon>
            添加法律书
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索容器 -->
    <div class="search-container">
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="section-label">搜索</div>
          <div class="search-items">
            <div class="search-item">
              <el-input
                v-model="searchStu.name"
                placeholder="搜索法律书名称..."
                clearable
                size="large"
              >
                <template #prefix>
                  <el-icon class="input-icon"><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" size="large" @click="queryPage()">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button type="info" size="large" @click="clear()">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="danger" size="large" @click="delByIds()">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 表格容器 -->
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">法律书列表</h3>
      </div>
      <!-- 列表展示 -->
      <el-table :data="tableData" style="width: 100%" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection"  align="center" width="50" />
        <el-table-column label="ID" align="center" width="80">
          <template #default="scope">
            <span style="font-weight: 600; color: var(--accent-dark);">{{ scope.row.autoId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="法律书名称" align="center" min-width="200">
          <template #default="scope">
            <span class="tag tag-blue">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="publishDate" label="发布日期" align="center" width="120" />
        <el-table-column prop="effectiveDate" label="生效日期" align="center" width="120" />
        <el-table-column label="操作" align="center" width="140" fixed="right">
          <template #default="scope">
            <div class="action-btns">
              <button class="action-btn" title="编辑" @click="updateStu(scope.row.id) ;resetForm(stuFormRef)">✏</button>
              <button class="action-btn danger" title="删除" @click="delById(scope.row.id)">🗑</button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/修改法律书对话框 -->
    <el-dialog v-model="dialogFormVisible" :title="formTitle" width="600px" :close-on-click-modal="false" class="case-dialog" destroy-on-close>
      <el-form :model="stu" ref="stuFormRef" :rules="rules" class="case-form">
        <div class="form-section">
          <div class="section-header">
            <el-icon><Document /></el-icon>
            法律书信息
          </div>
          <el-form-item label="法律书名称" prop="name" class="form-item-with-icon">
            <el-input v-model="stu.name" placeholder="请输入法律书名称" clearable>
              <template #prefix>
                <el-icon class="input-icon"><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <div class="form-row">
            <div class="form-item-half">
              <el-form-item label="发布日期" prop="publishDate">
                <el-date-picker
                  v-model="stu.publishDate"
                  type="date"
                  placeholder="选择发布日期"
                  style="width: 100%"
                />
              </el-form-item>
            </div>
            <div class="form-item-half">
              <el-form-item label="生效日期" prop="effectiveDate">
                <el-date-picker
                  v-model="stu.effectiveDate"
                  type="date"
                  placeholder="选择生效日期"
                  style="width: 100%"
                />
              </el-form-item>
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false; resetForm(stuFormRef)">取消</el-button>
          <el-button type="primary" @click="save(stuFormRef)">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>


<style scoped>
/* 页面变量 */
:root {
  --bg-primary: #F7F5F0;
  --bg-secondary: #FFFFFF;
  --accent: #C9A962;
  --accent-light: #E8D5A3;
  --accent-dark: #A68B4B;
  --text-primary: #1A1A1A;
  --text-secondary: #4A4A4A;
  --text-muted: #7A7A7A;
  --border: #E0DCD4;
  --card-shadow: 0 2px 12px rgba(45, 59, 53, 0.08);
  --card-shadow-hover: 0 8px 24px rgba(45, 59, 53, 0.12);
  --sidebar-bg: #1E3A2F;
}

/* 页面容器 */
.law-book-management {
  padding: 20px;
  background-color: var(--bg-primary);
  min-height: 100vh;
}

/* 页面头部样式 - 悬浮卡片效果 */
.page-header {
  background: linear-gradient(135deg, #1E3A2F 0%, #2A4A3F 100%) !important;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 24px;
  box-shadow: 
    0 4px 6px rgba(30, 58, 47, 0.05),
    0 10px 20px rgba(30, 58, 47, 0.1),
    0 20px 40px rgba(30, 58, 47, 0.15);
  border: 1px solid rgba(201, 169, 98, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.page-header:hover {
  box-shadow: 
    0 6px 12px rgba(30, 58, 47, 0.08),
    0 16px 32px rgba(30, 58, 47, 0.15),
    0 30px 60px rgba(30, 58, 47, 0.2);
  transform: translateY(-4px);
  border-color: rgba(201, 169, 98, 0.35);
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}

.page-header::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(201, 169, 98, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  transition: all 0.5s ease;
}

.page-header:hover::after {
  transform: scale(1.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #C9A962, #E8D5A3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sidebar-bg);
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3);
}

.header-icon:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 6px 16px rgba(201, 169, 98, 0.4);
}

.header-icon svg {
  width: 28px;
  height: 28px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.3);
  font-family: 'Cormorant Garamond', Georgia, serif;
  line-height: 1.2;
  transition: all 0.3s ease;
}

.page-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 500;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
  line-height: 1.3;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.header-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 搜索容器样式 - 悬浮卡片效果 */
.search-container {
  background: var(--bg-secondary);
  border-radius: 14px;
  border: 1px solid rgba(224, 220, 212, 0.8);
  box-shadow: 
    0 2px 4px rgba(45, 59, 53, 0.04),
    0 6px 12px rgba(45, 59, 53, 0.06),
    0 16px 28px rgba(45, 59, 53, 0.08);
  padding: 24px 28px;
  margin-bottom: 24px;
  transition: box-shadow 0.6s ease, border-color 0.6s ease;
  position: relative;
  overflow: hidden;
  z-index: 5;
}

.search-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 14px;
  border: 1px solid transparent;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.search-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  border-radius: 14px 14px 0 0;
}

.search-container:hover {
  box-shadow: 
    0 4px 8px rgba(45, 59, 53, 0.06),
    0 12px 24px rgba(45, 59, 53, 0.1),
    0 24px 48px rgba(45, 59, 53, 0.12);
  border-color: rgba(201, 169, 98, 0.4);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-width: 300px;
  flex-wrap: wrap;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 80px;
  flex-shrink: 0;
  white-space: nowrap;
  line-height: 1.4;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.search-items {
  display: flex;
  gap: 16px;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
}

.search-item {
  flex: 1;
  min-width: 200px;
  max-width: 280px;
  position: relative;
}

.search-item :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(45, 59, 53, 0.06);
  transition: all 0.2s ease;
  border: 1px solid var(--border);
  background: var(--bg-primary) !important;
}

.search-item :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(45, 59, 53, 0.1);
  border-color: var(--accent-light);
}

.search-item :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(201, 169, 98, 0.15);
  border-color: var(--accent);
}

.search-item :deep(.el-input__inner) {
  color: var(--text-primary);
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.search-item :deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

.search-item :deep(.el-input__prefix-inner .el-icon) {
  color: var(--accent-dark);
  font-size: 16px;
}

.toolbar-right {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-shrink: 0;
}

/* 按钮样式 */
.el-button {
  border-radius: 8px;
  font-weight: 600;
  padding: 10px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  font-size: 14px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  line-height: 1.4;
  min-width: 80px;
  text-align: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.6s ease;
  z-index: -1;
}

.el-button:hover::before {
  left: 100%;
}

.el-button--primary {
  background: linear-gradient(135deg, #C9A962, #E8D5A3);
  color: var(--sidebar-bg);
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3);
  font-weight: 600;
  text-shadow: none;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 8px;
}

.el-button--primary:hover {
  background: linear-gradient(135deg, #E8D5A3, #C9A962);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(201, 169, 98, 0.4);
  text-shadow: none;
}

.el-button--success {
  background: linear-gradient(135deg, #C9A962, #E8D5A3);
  color: var(--sidebar-bg);
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3);
  font-weight: 600;
  text-shadow: none;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 8px;
}

.el-button--success:hover {
  background: linear-gradient(135deg, #E8D5A3, #C9A962);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(201, 169, 98, 0.4);
  text-shadow: none;
}

.el-button--warning {
  background: linear-gradient(135deg, #ED8936, #DD6B20);
  color: white;
  box-shadow: 0 4px 12px rgba(237, 137, 54, 0.3);
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 8px;
}

.el-button--warning:hover {
  background: linear-gradient(135deg, #F6AD55, #ED8936);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(237, 137, 54, 0.4);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.el-button--danger {
  background: linear-gradient(135deg, #E53E3E, #C53030);
  color: white;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 8px;
}

.el-button--danger:hover {
  background: linear-gradient(135deg, #F56565, #E53E3E);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(229, 62, 62, 0.4);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.el-button--info {
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  box-shadow: 0 2px 8px rgba(45, 59, 53, 0.06);
  font-weight: 600;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 8px;
  min-width: 80px;
  text-align: center;
}

.el-button--info:hover {
  border-color: var(--accent);
  color: var(--accent-dark);
  background: rgba(201, 169, 98, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.2);
}

.el-button:disabled {
  opacity: 0.6;
  transform: none !important;
  box-shadow: none !important;
  background: var(--bg-primary) !important;
  border: 1px solid var(--border) !important;
  color: var(--text-muted) !important;
}

.el-button:disabled:hover {
  transform: none !important;
  box-shadow: none !important;
  background: var(--bg-primary) !important;
  border: 1px solid var(--border) !important;
  color: var(--text-muted) !important;
}

/* 表格容器 - 悬浮卡片效果 */
.table-container {
  background: var(--bg-secondary);
  border-radius: 14px;
  border: 1px solid rgba(224, 220, 212, 0.8);
  box-shadow: 
    0 2px 4px rgba(45, 59, 53, 0.04),
    0 6px 12px rgba(45, 59, 53, 0.06),
    0 16px 28px rgba(45, 59, 53, 0.08);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.table-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 14px;
  border: 1px solid transparent;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
}

.table-container:hover {
  box-shadow: 
    0 4px 8px rgba(45, 59, 53, 0.06),
    0 12px 24px rgba(45, 59, 53, 0.1),
    0 24px 48px rgba(45, 59, 53, 0.12);
  transform: translateY(-3px);
  border-color: rgba(201, 169, 98, 0.3);
}

.table-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-primary);
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Cormorant Garamond', Georgia, serif;
  letter-spacing: 0.5px;
}

/* 表格样式 */
.el-table {
  --el-table-border-color: var(--border);
  --el-table-header-bg-color: var(--bg-primary);
  --el-table-header-text-color: var(--text-muted);
  --el-table-row-hover-bg-color: rgba(201, 169, 98, 0.08);
}

.el-table {
  border-radius: 0;
  border: none;
}

.el-table :deep(th) {
  background: var(--bg-primary) !important;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.el-table :deep(td) {
  padding: 16px;
  font-size: 13px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all 0.2s ease;
}

.el-table :deep(.el-table__row) {
  transition: all 0.2s ease;
}

.el-table :deep(.el-table__row:hover) {
  background-color: rgba(201, 169, 98, 0.08);
  transform: translateY(-1px);
}

.el-table :deep(.el-table__row:last-child td) {
  border-bottom: none;
}

/* 标签样式 */
.tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all 0.2s ease;
}

.tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tag-blue {
  background: rgba(66, 153, 225, 0.12);
  color: #2B6CB0;
}

.tag-gold {
  background: rgba(201, 169, 98, 0.15);
  color: var(--accent-dark);
}

.tag-green {
  background: rgba(72, 187, 120, 0.12);
  color: #2F855A;
}

.tag-red {
  background: rgba(229, 62, 62, 0.12);
  color: #C53030;
}

/* 操作按钮样式 */
.action-btns {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.1), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  border-color: var(--accent);
  color: var(--accent-dark);
  background: rgba(201, 169, 98, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.2);
}

.action-btn.danger:hover {
  border-color: #E53E3E;
  color: #E53E3E;
  background: rgba(229, 62, 62, 0.08);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.2);
}

.action-btn.success-btn:hover {
  border-color: #48BB78;
  color: #48BB78;
  background: rgba(72, 187, 120, 0.08);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.2);
}

.action-btn.warning-btn {
  color: #ED8936;
}

.action-btn.warning-btn:hover {
  border-color: #ED8936;
  color: #ED8936;
  background: rgba(237, 137, 54, 0.08);
  box-shadow: 0 4px 12px rgba(237, 137, 54, 0.2);
}

/* 表格内的按钮样式 */
.el-table .el-button {
  margin: 0 2px;
  padding: 6px 12px;
  font-size: 12px;
}

/* 分页样式 */
.pagination-container {
  padding: 20px 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  background: var(--bg-primary);
}

.el-pagination {
  --el-pagination-bg-color: transparent;
  --el-pagination-button-bg-color: var(--bg-secondary);
  --el-pagination-hover-color: var(--accent);
}

.el-pagination :deep(.el-pager li) {
  border-radius: 8px;
  margin: 0 4px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.el-pagination :deep(.el-pager li:hover) {
  border-color: var(--accent);
  color: var(--accent-dark);
  transform: translateY(-1px);
}

.el-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #C9A962, #A68B4B) !important;
  border-color: #C9A962 !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3) !important;
  transform: translateY(-1px);
  font-weight: 700 !important;
  font-size: 14px !important;
  padding: 0 10px !important;
  min-width: 32px !important;
  height: 32px !important;
  line-height: 30px !important;
  text-align: center !important;
  z-index: 1 !important;
}

.el-pagination :deep(.btn-prev),
.el-pagination :deep(.btn-next) {
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.el-pagination :deep(.btn-prev:hover),
.el-pagination :deep(.btn-next:hover) {
  border-color: var(--accent);
  color: var(--accent-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.2);
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(45, 59, 53, 0.2);
  max-width: 640px;
  animation: dialogFadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transform-origin: center top;
}

@keyframes dialogFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.92) translateY(-30px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

:deep(.el-overlay) {
  animation: overlayFadeIn 0.25s ease forwards;
}

@keyframes overlayFadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, var(--sidebar-bg), #2A4A3F);
  padding: 20px 24px;
  margin: 0;
  border-bottom: none;
  position: relative;
  overflow: hidden;
}

:deep(.el-dialog__header::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}

:deep(.el-dialog__header::after) {
  content: '';
  position: absolute;
  top: -50%;
  right: -5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(201, 169, 98, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  transition: all 0.5s ease;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #ffffff;
  font-size: 18px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
}

:deep(.el-dialog__headerbtn) {
  top: 18px;
  right: 18px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-dialog__headerbtn:hover) {
  background: rgba(201, 169, 98, 0.2);
  transform: scale(1.05);
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

:deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #C9A962;
  transform: rotate(90deg) scale(1.15);
}

:deep(.el-dialog__body) {
  padding: 28px;
  background-color: var(--bg-primary);
  animation: bodyFadeIn 0.4s ease 0.1s forwards;
  opacity: 0;
}

@keyframes bodyFadeIn {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-dialog__footer) {
  padding: 20px 24px;
  border-top: 1px solid var(--border);
  background-color: var(--bg-secondary);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  animation: footerSlideIn 0.4s ease 0.2s forwards;
  opacity: 0;
}

@keyframes footerSlideIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 表单美化样式 */
.case-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border: 1px solid rgba(224, 220, 212, 0.6);
  position: relative;
  transition: all 0.3s ease;
  animation: sectionFadeIn 0.4s ease forwards;
  opacity: 0;
}

.form-section:nth-child(1) { animation-delay: 0.15s; }

@keyframes sectionFadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-section:hover {
  border-color: rgba(201, 169, 98, 0.4);
  box-shadow: 0 4px 16px rgba(45, 59, 53, 0.08);
}

.form-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  border-radius: 12px 12px 0 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.form-section:hover::before {
  opacity: 1;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.section-header .el-icon {
  font-size: 18px;
  color: var(--accent-dark);
  background: rgba(201, 169, 98, 0.15);
  padding: 6px;
  border-radius: 6px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-item-half {
  flex: 1;
}

.form-item-with-icon :deep(.el-input__wrapper) {
  padding-left: 12px;
}

.input-icon {
  color: var(--accent-dark);
  font-size: 16px;
}

.form-tip {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-header {
    padding: 24px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
  
  .header-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .toolbar-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .search-items {
    width: 100%;
  }
  
  .search-item {
    min-width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .header-left {
    flex-direction: column;
    text-align: center;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .search-container {
    padding: 16px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-right {
    justify-content: center;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  :deep(.el-dialog) {
    margin: 20px;
    width: auto !important;
  }
  
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}
</style>













