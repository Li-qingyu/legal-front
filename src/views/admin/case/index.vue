<script setup>
import { onMounted, ref, watch } from 'vue'
import { queryPageApi , addApi, queryInfoApi, updateApi, deleteApi} from '@/api/case'
import { queryAllApi as queryAllLegalTypeApi } from '@/api/type'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

//法律类型列表数据
const legalTypes = ref([])
//搜索表单对象
let searchClazz = ref({name:'', typeId:'', tag:''})
//列表展示数据
let tableData = ref([])

//钩子函数 - 页面加载时触发
onMounted(() => {
  queryPage()
  queryAllLegalTypes()
})

//所有的法律类型数据
const queryAllLegalTypes = async () => {
  let result = await queryAllLegalTypeApi()
  if(result.code) {
    legalTypes.value = result.data
  }
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
      searchClazz.value.name,
      searchClazz.value.typeId,
      searchClazz.value.tag,
      pagination.value.currentPage,
      pagination.value.pageSize
  );

  if(result.code) {
    tableData.value = result.data.rows
    pagination.value.total = result.data.total
  }
}

//清空搜索栏
const clear = () => {
  searchClazz.value = {name:'', typeId:'', tag:''}
  queryPage()
}

//复选框
let selectIds = ref([])
const handleSelectionChange = (selection) => {
  selectIds.value = selection.map(item => item.id)
}

//批量上架
const batchPublish = async () => {
  if(selectIds.value.length === 0) {
    ElMessage.warning('请选择要上架的案例')
    return
  }
  ElMessageBox.confirm('您确认批量上架选中的案例吗?' , '批量上架', {confirmButtonText:'确认', cancelButtonText:'取消',type:'warning'})
    .then(async () => {
      // 这里需要实现上架功能
      ElMessage.success('上架成功')
      queryPage()
    }).catch(() => {
      ElMessage.info('取消上架')
    })
}

//批量下架
const batchUnpublish = async () => {
  if(selectIds.value.length === 0) {
    ElMessage.warning('请选择要下架的案例')
    return
  }
  ElMessageBox.confirm('您确认批量下架选中的案例吗?' , '批量下架', {confirmButtonText:'确认', cancelButtonText:'取消',type:'warning'})
    .then(async () => {
      // 这里需要实现下架功能
      ElMessage.success('下架成功')
      queryPage()
    }).catch(() => {
      ElMessage.info('取消下架')
    })
}

//----------- 新增 / 修改 ---------------------------
let dialogFormVisible = ref(false) //控制新增/修改的对话框的显示与隐藏
let labelWidth = ref(80) //form表单label的宽度
let formTitle = ref('') //表单的标题
//法律案例对象-表单数据绑定
let clazz = ref({
  id: '',
  title: '',
  typeId: '',
  tags: '',
  content: '',
  cover: '',
  status: '1'
})

// 文件上传相关
const uploadUrl = 'https://api.example.com/upload'; // 这里需要替换为实际的上传接口
const uploadHeaders = ref({}); // 上传时的请求头
const uploadDisabled = ref(false); // 是否禁用上传

// 上传前的钩子函数
const handleBeforeUpload = (file) => {
  // 限制文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  // 限制文件大小
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB！');
    return false;
  }
  return true;
};

// 上传成功的回调函数
const handleUploadSuccess = (response, uploadFile) => {
  // 这里根据实际的上传接口返回格式来处理
  // 假设返回格式为 { code: 200, data: { url: '图片URL' } }
  if (response.code) {
    clazz.value.cover = response.data.url;
    ElMessage.success('图片上传成功');
  } else {
    ElMessage.error('图片上传失败');
  }
};

// 上传失败的回调函数
const handleUploadError = (error, uploadFile) => {
  ElMessage.error('图片上传失败，请重试');
};

// 移除图片的回调函数
const handleRemove = (file, fileList) => {
  clazz.value.cover = '';
};

// 预览图片
const handlePictureCardPreview = (uploadFile) => {
  // 这里可以实现图片预览功能
};

//清空表单
const clearClazz = () => {
  clazz.value = {
    id: '',
    title: '',
    typeId: '',
    tags: '',
    content: '',
    cover: '',
    status: '1'
  }
}

//新增法律案例
const addClazz = () => {
  dialogFormVisible.value = true
  formTitle.value = '新增法律案例'
  clearClazz()
}

//修改法律案例
const updateClazz = async (id) => {
  clearClazz()
  dialogFormVisible.value = true
  formTitle.value = '修改法律案例'
  let result = await queryInfoApi(id)
  if(result.code){
    // 处理状态字段类型转换
    const data = result.data;
    clazz.value = {
      ...data,
      status: data.status.toString() // 将数字转换为字符串
    };
  }
}

//表单校验规则
const clazzFormRef = ref()
const rules = ref({
  title: [
    { required: true, message: '案例标题为必填项', trigger: 'blur' },
    { min: 4, max: 50, message: '案例标题长度为4-50个字', trigger: 'blur' }
  ],
  typeId: [{ required: true, message: '法律类型为必填项', trigger: 'change' }],
  tags: [
    { required: true, message: '标签为必填项', trigger: 'blur' },
    { min: 2, max: 30, message: '标签长度为2-30个字', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '案例内容为必填项', trigger: 'blur' },
    { min: 10, message: '案例内容长度至少为10个字', trigger: 'blur' }
  ]
})

//重置表单
const resetForm = (clazzForm) => {
  if (!clazzForm) return
  clazzForm.resetFields()
}

//-------------保存法律案例信息 
const save = (clazzForm) => {
  //表单校验
  if(!clazzForm) return
  clazzForm.validate(async (valid) => {
    if(valid) {
      let api 
      if(clazz.value.id) {
        api = updateApi(clazz.value)
      }else {
        api = addApi(clazz.value)
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


//------- 删除法律案例
//根据ID删除单个法律案例
const delById = async (id) => {
  ElMessageBox.confirm('您确认删除此法律案例吗?' , '删除案例', {confirmButtonText:'确认', cancelButtonText:'取消',type:'warning'})
    .then(async () => {
      let result =  await deleteApi(id)
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

//发布案例
const publishCase = async (id) => {
  ElMessageBox.confirm('您确认发布此法律案例吗?' , '发布案例', {confirmButtonText:'确认', cancelButtonText:'取消',type:'warning'})
    .then(async () => {
      // 这里需要实现发布功能
      ElMessage.success('发布成功')
      queryPage()
    }).catch(() => {
      ElMessage.info('取消发布')
    })
}

//下架案例
const unpublishCase = async (id) => {
  ElMessageBox.confirm('您确认下架此法律案例吗?' , '下架案例', {confirmButtonText:'确认', cancelButtonText:'取消',type:'warning'})
    .then(async () => {
      // 这里需要实现下架功能
      ElMessage.success('下架成功')
      queryPage()
    }).catch(() => {
      ElMessage.info('取消下架')
    })
}
</script>

<template>

    <!-- 顶部标题 -->
    <div>
      <div id="title">法律案例管理</div><br>
    </div>

    <!-- 条件搜索表单 -->
    <el-form :inline="true" :model="searchClazz" class="demo-form-inline">
      <el-form-item label="案例标题">
        <el-input v-model="searchClazz.name" placeholder="搜索法律案例..."/>
      </el-form-item>
      
      <el-form-item label="法律类型">
        <el-select v-model="searchClazz.typeId" placeholder="全部法律类型">
          <el-option value="" label="全部法律类型" />
          <el-option v-for="type in legalTypes" :label="type.name" :value="type.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="标签">
        <el-input v-model="searchClazz.tag" placeholder="按标签搜索..."/>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="queryPage()">搜索</el-button>
        <el-button type="info" @click="clear()">清空</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 功能按钮 -->
    <el-button type="success" @click="addClazz();resetForm(clazzFormRef)">添加法律案例</el-button>
    <el-button type="primary" @click="batchPublish()">批量上架</el-button>
    <el-button type="warning" @click="batchUnpublish()">批量下架</el-button>
    <br><br>
    
    <!-- 列表展示 -->
    <el-table :data="tableData" border style="width: 100%" fit @selection-change="handleSelectionChange">
      <el-table-column type="selection"  align="center" width="35" />
      <el-table-column type="index" label="ID" width="55" align="center"/>
      <el-table-column prop="cover" label="封面" align="center" width="80px">
        <template #default="scope">
          <img v-if="scope.row.cover" :src="scope.row.cover" style="width: 60px; height: 40px; object-fit: cover;" />
          <span v-else>封面</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" align="center" />
      <el-table-column prop="typeName" label="类型" align="center" width="100px"/>
      <el-table-column prop="tags" label="标签" align="center" width="150px"/>
      <el-table-column prop="publishTime" label="发布时间" align="center" width="150px"/>
      <el-table-column prop="status" label="状态" align="center" width="80px" >
        <template #default="scope">
          {{ scope.row.status == 1 ? '发布' : '下架' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" @click="updateClazz(scope.row.id); resetForm(clazzFormRef)">编辑</el-button>
          <el-button type="danger" size="small" @click="delById(scope.row.id)">删除</el-button>
          <el-button v-if="scope.row.status == 1" type="warning" size="small" @click="unpublishCase(scope.row.id)">下架</el-button>
          <el-button v-else type="success" size="small" @click="publishCase(scope.row.id)">发布</el-button>
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



  
  <!-- 新增/修改法律案例对话框 -->
  <el-dialog v-model="dialogFormVisible" :title="formTitle" width="60%">
    <el-form :model="clazz" ref="clazzFormRef" :rules="rules">
      <el-form-item label="案例标题" :label-width="labelWidth" prop="title">
        <el-input v-model="clazz.title" placeholder="请输入案例标题" />
      </el-form-item>

      <el-form-item label="法律类型" :label-width="labelWidth" prop="typeId">
        <el-select v-model="clazz.typeId" placeholder="请选择法律类型" style="width: 100%;">
          <el-option v-for="type in legalTypes" :label="type.name" :value="type.id" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="标签" :label-width="labelWidth" prop="tags">
        <el-input v-model="clazz.tags" placeholder="请输入标签，多个标签用逗号分隔" />
      </el-form-item>

      <el-form-item label="案例内容" :label-width="labelWidth" prop="content">
        <el-input v-model="clazz.content" type="textarea" :rows="5" placeholder="请输入案例内容" />
      </el-form-item>

      <el-form-item label="封面图片" :label-width="labelWidth">
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :disabled="uploadDisabled"
          :show-file-list="true"
          :on-before-upload="handleBeforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-remove="handleRemove"
          :on-preview="handlePictureCardPreview"
          :file-list="[]"
          list-type="picture-card"
          accept="image/*"
        >
          <el-icon v-if="!clazz.cover"><Plus /></el-icon>
          <img v-else :src="clazz.cover" class="avatar" style="width: 100%; height: 100%; object-fit: cover;" />
        </el-upload>
        <el-button v-if="clazz.cover" type="danger" size="small" @click="clazz.cover = ''">移除图片</el-button>
      </el-form-item>

      <el-form-item label="状态" :label-width="labelWidth">
        <el-select v-model="clazz.status" placeholder="请选择状态" style="width: 100%;">
          <el-option label="发布" value="1" />
          <el-option label="下架" value="0" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false; resetForm(clazzFormRef)">取消</el-button>
        <el-button type="primary" @click="save(clazzFormRef)">保存</el-button>
      </span>
    </template>
  </el-dialog>

</template>


<style scoped>
/* 页面容器 */
.case-management {
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

/* 表格中的图片样式 */
.el-table img {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  border-radius: 4px;
  transition: all 0.3s ease;
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 上传组件样式 */
:deep(.el-upload--picture-card) {
  border-radius: 8px;
  border: 2px dashed #d9d9d9;
  transition: all 0.3s ease;
}

:deep(.el-upload--picture-card:hover) {
  border-color: #409eff;
  background-color: #f5f7fa;
}

/* 状态标签样式 */
.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-published {
  background-color: #e6f7e6;
  color: #52c41a;
}

.status-unpublished {
  background-color: #fff1f0;
  color: #ff4d4f;
}
</style>