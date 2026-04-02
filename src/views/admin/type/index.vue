<script setup>
import {ref,onMounted, watch} from 'vue'
import { queryAllApi,addApi,queryIdApi,updateApi,deleteIdApi } from '@/api/type';
import { ElMessage ,ElMessageBox} from 'element-plus'


//查询数据
const deptList=ref([])
// 新增法律类型数据
const dialogFormVisible=ref(false);
const fromName=ref('');
const dept=ref({name:'', description:''});
const deptFormRef=ref();//绑定表单对象
const searchKeyword=ref('');//搜索关键字

//监听搜索关键字变化，当搜索关键字变为空时自动更新页面数据
watch(searchKeyword, (newVal, oldVal) => {
  if ((!newVal || newVal === '') && 
      (oldVal)) {
    search()
  }
})

//查询
const search = async()=>{
  const result =await queryAllApi(searchKeyword.value);
  if(result.code){
    // 为每条数据添加自增ID
    deptList.value=result.data.map((item, index) => ({
      ...item,
      autoId: index + 1
    }));
  }else{
      //失败
      //提示操作信息
      ElMessage.error(result.msg);
  }
}
//编辑法律类型
const edit=async(id)=>{
  fromName.value='编辑法律类型';
  if(deptFormRef.value) {
    deptFormRef.value.resetFields();
  }
  const result=await queryIdApi(id);
  if(result.code){
    dialogFormVisible.value=true;
    dept.value=result.data;
  }else{
      //失败
      //提示操作信息
      ElMessage.error(result.msg);
  }

}
//新增法律类型
const addDept=()=>{
  dialogFormVisible.value =true ;
  fromName.value="新增法律类型";
  dept.value={name: '', description: ''};
  //重置表单校验规则
  if(deptFormRef.value) {
    deptFormRef.value.resetFields();
  }
}
const save= async()=>{
  //表单校验
  if(!deptFormRef.value)return;
  deptFormRef.value.validate(async(valid)=>{//valid表示是否校验通过
    if(valid){
      let result;
      if(dept.value.id){//有id修改
        result=await updateApi(dept.value);
      }else{//无id是新增
        result=await addApi(dept.value);
      }
      if(result.code){//成功
        //提示操作信息
        ElMessage.success('保存成功');
        //关闭对话框
        dialogFormVisible.value =false ;
        //再次查询
        search();
      }else{//失败
        //提示操作信息
        ElMessage.error(result.msg);
        //关闭对话框
        dialogFormVisible.value =false ;
      }
    }else{
      ElMessage.error('表单信息校验不通过');
    }
  })

}
//删除法律类型
const delById=async(id)=>{
  //弹出确认框
  ElMessageBox.confirm('是否确认删除法律类型','提示',
    {confirmButtonText: '确认',cancelButtonText: '取消',type: 'warning',}
  ).then(async() => {
    const result=await deleteIdApi(id);
    if(result.code){
      ElMessage.success('删除成功');
      search();
    }else{
      ElMessage.error(result.msg);
    }

  }).catch(() => {
    ElMessage.info('您已取消删除')
  })
}

//钩子函数
onMounted(() => {
  search();
});

//表单校验相关
const rules=ref({
  name :[
    {required :true, message :'法律类型名称必须填写',trigger :'blur'},
    {min: 2,max: 20, message :'法律类型名称长度必须在2-20位之间',trigger :'blur'},
  ],
  description :[
    {required :true, message :'法律类型描述必须填写',trigger :'blur'},
    {min: 5,max: 100, message :'法律类型描述长度必须在5-100位之间',trigger :'blur'},
  ]
})

</script>

<template>
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 16H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 8H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="header-text">
          <h1 class="page-title">法律类型管理</h1>
          <p class="page-subtitle">Legal Type Management System</p>
        </div>
        <div class="header-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-dot"></div>
        </div>
      </div>
    </div>

    <!-- 条件搜索表单 -->
    <el-form :inline="true" :model="{keyword: searchKeyword}" class="demo-form-inline">
      <el-form-item label="法律类型">
        <el-input v-model="searchKeyword" placeholder="搜索法律类型..." style="width: 300px;"/>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search">搜索</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 功能按钮 -->
    <el-button type="success" @click="addDept">添加法律类型</el-button>
    <br><br>
  <!-- Dialog对话框 -->
  <el-dialog v-model="dialogFormVisible" :title="fromName" width="500">
    <el-form :model="dept" :rules="rules" ref="deptFormRef">
      <el-form-item label="类型名称" label-width="140px" prop="name">
        <el-input v-model="dept.name" />
      </el-form-item>
      <el-form-item label="描述" label-width="140px" prop="description">
        <el-input v-model="dept.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </div>
    </template>
  </el-dialog>


  <div class="container">
    <el-table :data="deptList" border style="width: 100%">
      <el-table-column label="ID" width="80" align="center">
        <template #default="scope">
          {{ scope.row.autoId }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="类型名称" width="150" align="center"/>
      <el-table-column prop="description" label="描述" align="center"/>
      <el-table-column prop="updateTime" label="最后操作时间"width="200" align="center"/>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" @click="edit(scope.row.id)">编辑</el-button>
          <el-button type="danger" size="small"  @click="delById(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
/* 页面容器 */
.type-management {
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

.el-button--warning {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
}

.el-button--warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(250, 173, 20, 0.3);
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
