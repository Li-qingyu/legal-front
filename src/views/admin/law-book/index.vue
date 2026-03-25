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
    <div>
      <div id="title">法律书管理</div><br>
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

/* 标题样式 */
#title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #409eff;
  display: flex;
  align-items: center;
}

#title::before {
  content: '';
  width: 4px;
  height: 24px;
  background-color: #409eff;
  margin-right: 12px;
  border-radius: 2px;
}

/* 搜索表单样式 */
.demo-form-inline {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.demo-form-inline :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 20px;
}

.demo-form-inline :deep(.el-input__inner) {
  border-radius: 4px;
}

/* 按钮样式 */
.el-button {
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 表格样式 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-table :deep(th) {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: 600;
}

.el-table :deep(td) {
  padding: 12px 0;
}

.el-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 操作按钮样式 */
.el-table .el-button {
  margin: 0 4px;
}

/* 分页样式 */
.el-pagination {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end;
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background-color: #f5f7fa;
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 30px 20px;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

/* 表单样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__inner) {
  border-radius: 4px;
  transition: all 0.3s ease;
}

:deep(.el-input__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style>













