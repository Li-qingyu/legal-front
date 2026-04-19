<script setup>
import {ref,onMounted, watch} from 'vue'
import { queryAllApi,addApi,queryIdApi,updateApi,deleteIdApi } from '@/api/type';
import { ElMessage ,ElMessageBox} from 'element-plus'
import { Plus, Search, PriceTag, Close, Edit, Delete } from '@element-plus/icons-vue'


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
  <div class="type-management">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
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
        </div>
        <div class="header-right">
          <el-button type="success" size="large" @click="addDept">
            <el-icon style="margin-right: 4px;"><Plus /></el-icon>添加法律类型
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索工具栏 -->
    <div class="search-container">
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="section-label">筛选条件</div>
          <div class="search-items">
            <div class="search-item">
              <el-input 
                v-model="searchKeyword" 
                placeholder="搜索法律类型" 
                clearable
                size="large"
                @keyup.enter="search"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" size="large" @click="search">
            <el-icon style="margin-right: 4px;"><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>
    </div>
  
  <!-- Dialog对话框 -->
  <el-dialog v-model="dialogFormVisible" :title="fromName" width="600px" :close-on-click-modal="false" class="case-dialog" destroy-on-close>
    <template #header="{ close }">
      <div class="dialog-header">
        <span class="dialog-title">{{ fromName }}</span>
      </div>
    </template>
    <el-form :model="dept" :rules="rules" ref="deptFormRef" label-position="top" class="case-form">
      <!-- 基本信息区域 -->
      <div class="form-section">
        <div class="section-header">
          <el-icon><PriceTag /></el-icon>
          <span>类型信息</span>
        </div>
        
        <el-form-item label="类型名称" prop="name" class="form-item-with-icon">
          <el-input v-model="dept.name" placeholder="请输入法律类型名称（2-20字）" clearable>
            <template #prefix>
              <el-icon class="input-icon"><PriceTag /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="描述" prop="description" class="form-item-with-icon">
          <el-input 
            v-model="dept.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入法律类型描述（5-100字）"
            show-word-limit
            maxlength="100"
          />
          <div class="form-tip">描述长度为5-100字</div>
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false" class="cancel-btn">
          <el-icon style="margin-right: 4px;"><Close /></el-icon>
          取消
        </el-button>
        <el-button type="primary" @click="save" class="save-btn">
          <el-icon style="margin-right: 4px;"><Plus /></el-icon>
          保存类型
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 表格容器 -->
  <div class="table-container">
    <div class="table-header">
      <h3 class="table-title">法律类型列表</h3>
    </div>

    <!-- 列表展示 -->
    <el-table :data="deptList" style="width: 100%" stripe>
      <el-table-column label="ID" width="70" align="center">
        <template #default="scope">
          <span style="font-weight: 600; color: var(--accent-dark);">{{ scope.row.autoId }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="类型名称" min-width="150" align="center">
        <template #default="scope">
          <span class="tag tag-gold">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" align="center">
        <template #default="scope">
          <el-tooltip :content="scope.row.description" placement="top">
            <span>{{ scope.row.description.length > 50 ? scope.row.description.substring(0, 50) + '...' : scope.row.description }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="最后操作时间" align="center" width="160"/>
      <el-table-column label="操作" align="center" width="140" fixed="right">
          <template #default="scope">
            <div class="action-btns">
              <button class="action-btn" title="编辑" @click="edit(scope.row.id)">✏</button>
              <button class="action-btn danger" title="删除" @click="delById(scope.row.id)">🗑</button>
            </div>
          </template>
        </el-table-column>
    </el-table>
  </div>
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
.type-management {
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

/* 表格内的按钮样式 */
.el-table .el-button {
  margin: 0 2px;
  padding: 6px 12px;
  font-size: 12px;
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
