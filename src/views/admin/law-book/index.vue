<script setup>
import { onMounted, ref, watch } from 'vue'
import { queryPageApi , addApi, queryInfoApi, updateApi, deleteApi} from '@/api/law-book'
import { ElMessage, ElMessageBox } from 'element-plus'

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
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="header-content">
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
        <div class="header-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-dot"></div>
        </div>
      </div>
    </div>

    <!-- 条件搜索表单 -->
    <el-form :inline="true" :model="searchStu" class="demo-form-inline">
      <el-form-item label="法律书名称">
        <el-input v-model="searchStu.name" placeholder="搜索法律书名称..."/>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="queryPage()">搜索</el-button>
        <el-button type="info" @click="clear()">清空</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 功能按钮 -->
    <el-button type="success" @click="addStu();resetForm(stuFormRef)">添加法律书</el-button>
    <el-button type="danger" @click="delByIds()">批量删除</el-button>
    <br><br>
    
    
    <!-- 列表展示 -->
    <el-table :data="tableData" border style="width: 100%" fit @selection-change="handleSelectionChange">
      <el-table-column type="selection"  align="center" width="35" />
      <el-table-column label="ID" align="center" width="50px">
        <template #default="scope">
          {{ scope.row.autoId }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="法律书名称" align="center" />
      <el-table-column prop="publishDate" label="发布日期" align="center" width="120px" />
      <el-table-column prop="effectiveDate" label="生效日期" align="center" width="120px" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" @click="updateStu(scope.row.id) ;resetForm(stuFormRef)">编辑</el-button>
          <el-button type="danger" size="small" @click="delById(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <br>

    <!-- 分页组件Pagination -->
    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :page-sizes="[5, 10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 新增/修改法律书对话框 -->
    <el-dialog v-model="dialogFormVisible" :title="formTitle" width="70%">
      <el-form :model="stu" ref="stuFormRef" :rules="rules">
        <!-- 第一行 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="法律书名称" :label-width="labelWidth" prop="name">
              <el-input v-model="stu.name" placeholder="请输入法律书名称" style="width: 100%" size="default"/>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 第二行 -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="发布日期" :label-width="labelWidth" prop="publishDate">
              <el-date-picker
                v-model="stu.publishDate"
                type="date"
                placeholder="选择发布日期"
                style="width: 100%"
                size="default"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生效日期" :label-width="labelWidth" prop="effectiveDate">
              <el-date-picker
                v-model="stu.effectiveDate"
                type="date"
                placeholder="选择生效日期"
                style="width: 100%"
                size="default"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false; resetForm(stuFormRef)">取消</el-button>
          <el-button type="primary" @click="save(stuFormRef)">保存</el-button>
        </span>
      </template>
    </el-dialog>

</template>


<style scoped>
/* 页面容器 */
.law-book-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3584e4 100%);
  border-radius: 16px;
  padding: 32px 40px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(30, 60, 114, 0.25);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #d4af37;
  flex-shrink: 0;
}

.header-icon svg {
  width: 36px;
  height: 36px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.header-decoration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.6;
}

.decoration-line {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

.decoration-dot {
  width: 8px;
  height: 8px;
  background: #d4af37;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.6);
}

/* 搜索表单样式 */
.demo-form-inline {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(30, 60, 114, 0.08);
}

.demo-form-inline :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 20px;
}

.demo-form-inline :deep(.el-form-item__label) {
  color: #1e3c72;
  font-weight: 600;
  font-size: 14px;
}

.demo-form-inline :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.demo-form-inline :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(30, 60, 114, 0.15);
}

.demo-form-inline :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(30, 60, 114, 0.1), 0 4px 12px rgba(30, 60, 114, 0.15);
}

/* 按钮样式 */
.el-button {
  border-radius: 8px;
  font-weight: 500;
  padding: 10px 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-right: 10px;
}

.el-button--primary {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 60, 114, 0.3);
}

.el-button--success {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.el-button--success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(82, 196, 26, 0.3);
}

.el-button--danger {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
}

.el-button--danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 77, 79, 0.3);
}

.el-button--info {
  background: linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%);
}

.el-button--info:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(140, 140, 140, 0.3);
}

/* 表格样式 */
.el-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(30, 60, 114, 0.08);
}

.el-table :deep(th) {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.el-table :deep(td) {
  padding: 16px 0;
  font-size: 14px;
}

.el-table :deep(.el-table__row) {
  transition: all 0.3s ease;
}

.el-table :deep(.el-table__row:hover) {
  background-color: rgba(30, 60, 114, 0.05);
  transform: scale(1.01);
}

.el-table :deep(.el-table__row:hover td) {
  background-color: transparent;
}

/* 操作按钮样式 */
.el-table .el-button {
  margin: 0 4px;
  padding: 6px 14px;
  font-size: 13px;
}

/* 分页样式 */
.el-pagination {
  margin-top: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(30, 60, 114, 0.08);
  display: flex;
  justify-content: flex-end;
}

.el-pagination :deep(.el-pager li) {
  border-radius: 6px;
  margin: 0 4px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.el-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(30, 60, 114, 0.3);
}

.el-pagination :deep(.btn-prev),
.el-pagination :deep(.btn-next) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.el-pagination :deep(.btn-prev:hover),
.el-pagination :deep(.btn-next:hover) {
  background-color: rgba(30, 60, 114, 0.1);
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 24px 32px;
  margin: 0;
  border-bottom: none;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #ffffff;
  font-size: 18px;
  letter-spacing: 0.5px;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #ffffff;
  font-size: 20px;
  transition: all 0.3s ease;
}

:deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #d4af37;
  transform: rotate(90deg);
}

:deep(.el-dialog__body) {
  padding: 32px;
  background-color: #fafafa;
}

:deep(.el-dialog__footer) {
  padding: 20px 32px;
  border-top: 1px solid rgba(30, 60, 114, 0.1);
  background-color: #ffffff;
}

/* 表单样式 */
:deep(.el-form-item__label) {
  font-weight: 600;
  color: #1e3c72;
  font-size: 14px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  box-shadow: 0 4px 12px rgba(30, 60, 114, 0.15);
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px rgba(30, 60, 114, 0.1), 0 4px 12px rgba(30, 60, 114, 0.15);
  border-color: #1e3c72;
}

:deep(.el-select .el-input__wrapper) {
  cursor: pointer;
}

:deep(.el-date-editor .el-input__wrapper) {
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-header {
    padding: 24px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .header-icon {
    width: 56px;
    height: 56px;
  }
  
  .header-icon svg {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .header-decoration {
    display: none;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .demo-form-inline {
    padding: 16px;
  }
  
  .demo-form-inline :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>













