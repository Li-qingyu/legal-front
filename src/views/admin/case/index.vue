<script setup>
import { onMounted, ref, watch } from 'vue'
import { queryPageApi , addApi, queryInfoApi, updateApi, deleteApi, batchToggleStatusApi} from '@/api/case'
import { queryAllApi1 as queryAllLegalTypeApi } from '@/api/type'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Search, PriceTag, Clock, Close } from '@element-plus/icons-vue'

//法律类型列表数据
const legalTypes = ref([])
//搜索表单对象
let searchClazz = ref({name:'', typeId:'', tag:''})
//列表展示数据
let tableData = ref([])

//搜索状态
const isSearching = ref(false)

//搜索历史
const searchHistory = ref([])
const maxHistorySize = 5
const showHistory = ref(false)

//防抖定时器
let debounceTimer = null

//钩子函数 - 页面加载时触发
onMounted(() => {
  queryPage()
  queryAllLegalTypes()
  loadSearchHistory()
})

//加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = localStorage.getItem('caseSearchHistory')
    if (history) {
      searchHistory.value = JSON.parse(history)
    }
  } catch (e) {
    console.log('加载搜索历史失败', e)
  }
}

//保存搜索历史
const saveSearchHistory = (searchData) => {
  const keyword = searchData.name || searchData.tag
  if (!keyword) return
  
  //去重
  searchHistory.value = searchHistory.value.filter(item => item !== keyword)
  //添加到开头
  searchHistory.value.unshift(keyword)
  //限制数量
  if (searchHistory.value.length > maxHistorySize) {
    searchHistory.value = searchHistory.value.slice(0, maxHistorySize)
  }
  
  try {
    localStorage.setItem('caseSearchHistory', JSON.stringify(searchHistory.value))
  } catch (e) {
    console.log('保存搜索历史失败', e)
  }
}

//清除搜索历史
const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('caseSearchHistory')
  ElMessage.success('搜索历史已清除')
}

//使用历史记录搜索
const useHistoryItem = (keyword) => {
  searchClazz.value.name = keyword
  showHistory.value = false
  executeSearch()
}

//监听搜索条件变化 - 带防抖
watch(searchClazz, (newVal, oldVal) => {
  // 检测是否有变化
  const nameChanged = newVal.name !== oldVal.name
  const typeChanged = newVal.typeId !== oldVal.typeId
  const tagChanged = newVal.tag !== oldVal.tag
  
  if (nameChanged || typeChanged || tagChanged) {
    // 重置到第一页
    pagination.value.currentPage = 1
    
    // 防抖处理：500ms后执行搜索
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    debounceTimer = setTimeout(() => {
      executeSearch()
    }, 500)
  }
}, { deep: true })

//执行搜索
const executeSearch = async () => {
  isSearching.value = true
  
  try {
    await queryPage()
    
    //保存搜索历史
    saveSearchHistory(searchClazz.value)
  } catch (error) {
    console.error('搜索失败', error)
  } finally {
    isSearching.value = false
  }
}

//监听输入框聚焦，显示历史记录
const onSearchFocus = () => {
  if (searchHistory.value.length > 0) {
    showHistory.value = true
  }
}

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
  searchClazz.value = {name:'', typeId:'', tag:''}
  queryPage()
}

//复选框
let selectIds = ref([])
const handleSelectionChange = (selection) => {
  selectIds.value = selection.map(item => item.id)
}

//批量切换状态
const batchToggleStatus = async () => {
  if(selectIds.value.length === 0) {
    ElMessage.warning('请选择要操作的案例')
    return
  }
  
  // 检查选中案例的状态，决定是上架还是下架
  const selectedItems = tableData.value.filter(item => selectIds.value.includes(item.id))
  if(selectedItems.length === 0) {
    ElMessage.warning('请选择要操作的案例')
    return
  }
  
  // 假设所有选中的案例状态相同，取第一个案例的状态
  const currentStatus = selectedItems[0].status
  const newStatus = currentStatus === 1 ? 0 : 1
  const operationText = newStatus === 1 ? '上架' : '下架'
  
  ElMessageBox.confirm(`您确认批量${operationText}选中的案例吗?` , `批量${operationText}`, {confirmButtonText:'确认', cancelButtonText:'取消',type:'warning'})
    .then(async () => {
      const result = await batchToggleStatusApi(selectIds.value, newStatus)
      if(result.code) {
        ElMessage.success(`${operationText}成功`)
        queryPage()
      } else {
        ElMessage.error(result.msg)
      }
    }).catch(() => {
      ElMessage.info(`取消${operationText}`)
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
  judgment: '',
  cover: '',
  status: '1'
})

// 文件上传相关
const uploadUrl = '/api/upload'; // 上传接口
const uploadHeaders = ref({}); // 上传时的请求头
const uploadDisabled = ref(false); // 是否禁用上传
const fileList = ref([]); // 上传文件列表

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
  // 注意：由于响应拦截器已经返回了response.data，所以这里的response已经是后端返回的数据
  console.log('上传成功响应:', response);
  if (response.code) {
    const imageUrl = response.data?.url || response.url || response.data;
    clazz.value.cover = imageUrl;
    fileList.value = [{ name: uploadFile.name, url: imageUrl }];
    console.log('设置的cover值:', clazz.value.cover);
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
  fileList.value = [];
  console.log('图片已移除');
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
    judgment: '',
    cover: '',
    status: '1'
  }
  fileList.value = [];
  console.log('表单已清空');
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
    // 初始化fileList
    if(data.cover) {
      fileList.value = [{ name: 'cover', url: data.cover }];
    }
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
      console.log('保存的案例数据:', clazz.value);
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

//切换案例状态
const toggleCaseStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === 1 ? 0 : 1
  const operationText = newStatus === 1 ? '发布' : '下架'
  
  ElMessageBox.confirm(`您确认${operationText}此法律案例吗?` , `${operationText}案例`, {confirmButtonText:'确认', cancelButtonText:'取消',type:'warning'})
    .then(async () => {
      const result = await batchToggleStatusApi([id], newStatus)
      if(result.code) {
        ElMessage.success(`${operationText}成功`)
        queryPage()
      } else {
        ElMessage.error(result.msg)
      }
    }).catch(() => {
      ElMessage.info(`取消${operationText}`)
    })
}
</script>

<template>
  <!-- 页面头部 -->
  <div class="page-header">
    <div class="header-content">
      <div class="header-left">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 7h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="header-text">
          <h1 class="page-title">法律案例管理</h1>
          <p class="page-subtitle">Legal Case Management</p>
        </div>
      </div>
      <div class="header-right">
        <el-button type="success" @click="addClazz();resetForm(clazzFormRef)">
          <el-icon style="margin-right: 4px;"><Plus /></el-icon>新增案例
        </el-button>
        <el-tooltip content="请先勾选要操作的案例" placement="bottom" :disabled="selectIds.length > 0">
          <span>
            <el-button 
              type="primary" 
              :disabled="selectIds.length === 0"
              @click="batchToggleStatus()">
              批量操作
              <span v-if="selectIds.length > 0" class="batch-count">({{ selectIds.length }})</span>
            </el-button>
          </span>
        </el-tooltip>
      </div>
    </div>
  </div>

  <!-- 搜索工具栏 -->
  <div class="search-container">
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="section-label">筛选条件</div>
        <div class="search-items" @click.stop>
          <!-- 搜索历史下拉 -->
          <transition name="slide-fade">
            <div v-if="showHistory && searchHistory.length > 0" class="search-history-dropdown">
              <div class="history-header">
                <span class="history-title">搜索历史</span>
                <button class="clear-history" @click.stop="clearSearchHistory">清除</button>
              </div>
              <div class="history-list">
                <div 
                  v-for="(item, index) in searchHistory" 
                  :key="index"
                  class="history-item"
                  @click="useHistoryItem(item)">
                  <el-icon><Clock /></el-icon>
                  <span>{{ item }}</span>
                </div>
              </div>
            </div>
          </transition>
          
          <div class="search-item">
            <el-select v-model="searchClazz.typeId" placeholder="法律类型" clearable size="large" @change="executeSearch">
              <el-option value="" label="全部类型" />
              <el-option v-for="type in legalTypes" :label="type.name" :value="type.id" />
            </el-select>
          </div>
          <div class="search-item">
            <el-input 
              v-model="searchClazz.name" 
              placeholder="案例标题" 
              clearable
              size="large"
              @keyup.enter="executeSearch"
              @focus="onSearchFocus"
              @blur="setTimeout(() => showHistory = false, 200)">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #suffix v-if="searchClazz.name">
                <el-icon class="clear-input" @click="searchClazz.name = ''"><Close /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="search-item">
            <el-input 
              v-model="searchClazz.tag" 
              placeholder="标签" 
              clearable
              size="large"
              @keyup.enter="executeSearch"
              @focus="onSearchFocus"
              @blur="setTimeout(() => showHistory = false, 200)">
              <template #prefix>
                <el-icon><PriceTag /></el-icon>
              </template>
              <template #suffix v-if="searchClazz.tag">
                <el-icon class="clear-input" @click="searchClazz.tag = ''"><Close /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" size="large" @click="executeSearch" :loading="isSearching">
          <el-icon v-if="!isSearching" style="margin-right: 4px;"><Search /></el-icon>
          {{ isSearching ? '搜索中...' : '搜索' }}
        </el-button>
        <el-button size="large" @click="clear()">清空</el-button>
      </div>
    </div>
  </div>
  
  <!-- 表格容器 -->
  <div class="table-container">
    <div class="table-header">
      <h3 class="table-title">案例列表</h3>
    </div>

    <!-- 列表展示 -->
    <el-table :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="50" />
      <el-table-column label="ID" width="70" align="center">
        <template #default="scope">
          <span style="font-weight: 600; color: var(--accent-dark);">{{ scope.row.autoId }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="cover" label="封面" align="center" width="100">
        <template #default="scope">
          <img v-if="scope.row.cover" :src="scope.row.cover" class="table-cover" />
          <div v-else class="cover-placeholder">暂无</div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="案例标题" min-width="200" />
      <el-table-column prop="typeName" label="类型" align="center" width="110">
        <template #default="scope">
          <span class="tag tag-blue">{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="tags" label="标签" align="center" width="140">
        <template #default="scope">
          <span class="tag tag-gold">{{ scope.row.tags?.split(',')[0] || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="publishTime" label="发布时间" align="center" width="160"/>
      <el-table-column prop="status" label="状态" align="center" width="100" >
        <template #default="scope">
          <span :class="['status', scope.row.status == 1 ? 'status-published' : 'status-unpublished']">
            {{ scope.row.status == 1 ? '已发布' : '未发布' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" fixed="right">
        <template #default="scope">
          <div class="action-btns">
            <button class="action-btn" title="编辑" @click="updateClazz(scope.row.id); resetForm(clazzFormRef)">✏</button>
            <button class="action-btn danger" title="删除" @click="delById(scope.row.id)">🗑</button>
            <el-tooltip :content="scope.row.status == 1 ? '下架' : '发布'" placement="top">
              <button 
                class="action-btn" 
                :class="scope.row.status == 1 ? 'warning-btn' : 'success-btn'"
                @click="toggleCaseStatus(scope.row.id, scope.row.status)">
                <el-icon v-if="scope.row.status == 1"><Download /></el-icon>
                <el-icon v-else><Upload /></el-icon>
              </button>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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

  <!-- 新增/修改对话框 -->
  <el-dialog 
    v-model="dialogFormVisible" 
    :title="formTitle" 
    width="600px" 
    :close-on-click-modal="false"
    class="case-dialog"
    destroy-on-close
  >
    <template #header="{ close }">
      <div class="dialog-header">
        <span class="dialog-title">{{ formTitle }}</span>
      </div>
    </template>
    <el-form :model="clazz" ref="clazzFormRef" :rules="rules" label-position="top" class="case-form">
      <!-- 基本信息区域 -->
      <div class="form-section">
        <div class="section-header">
          <el-icon><PriceTag /></el-icon>
          <span>基本信息</span>
        </div>
        
        <el-form-item label="案例标题" prop="title" class="form-item-with-icon">
          <el-input v-model="clazz.title" placeholder="请输入案例标题（4-50字）" clearable>
            <template #prefix>
              <el-icon class="input-icon"><PriceTag /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <div class="form-row">
          <el-form-item label="法律类型" prop="typeId" class="form-item-half">
            <el-select v-model="clazz.typeId" placeholder="请选择法律类型" style="width: 100%;">
              <el-option v-for="type in legalTypes" :label="type.name" :value="type.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="发布状态" class="form-item-half">
            <el-select v-model="clazz.status" placeholder="请选择状态" style="width: 100%;">
              <el-option label="🟢 发布" value="1" />
              <el-option label="🔴 下架" value="0" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="案例标签" prop="tags" class="form-item-with-icon">
          <el-input v-model="clazz.tags" placeholder="请输入标签，多个标签用逗号分隔" clearable>
            <template #prefix>
              <el-icon class="input-icon"><PriceTag /></el-icon>
            </template>
          </el-input>
          <div class="form-tip">多个标签请用逗号分隔</div>
        </el-form-item>
      </div>

      <!-- 详细内容区域 -->
      <div class="form-section">
        <div class="section-header">
          <el-icon><Clock /></el-icon>
          <span>案例详情</span>
        </div>
        
        <el-form-item label="案例内容" prop="content" class="form-item-with-icon">
          <el-input 
            v-model="clazz.content" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入案例详细描述，包括案件背景、诉讼请求、事实与理由等..."
            show-word-limit
            maxlength="2000"
          />
        </el-form-item>

        <el-form-item label="判决结果">
          <el-input 
            v-model="clazz.judgment" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入判决结果（可选）"
            show-word-limit
            maxlength="1000"
          />
        </el-form-item>
      </div>

      <!-- 封面图片区域 -->
      <div class="form-section">
        <div class="section-header">
          <el-icon><Upload /></el-icon>
          <span>封面图片</span>
        </div>
        
        <el-form-item label="上传封面">
          <div class="upload-wrapper">
            <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :disabled="uploadDisabled"
              :show-file-list="false"
              :file-list="fileList"
              :on-before-upload="handleBeforeUpload"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :on-remove="handleRemove"
              :on-preview="handlePictureCardPreview"
              accept="image/*"
            >
              <div v-if="clazz.cover" class="cover-preview">
                <img :src="clazz.cover" class="cover-image" />
                <div class="cover-overlay">
                  <el-icon><Upload /></el-icon>
                  <span>更换图片</span>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <span class="upload-text">上传封面</span>
                <span class="upload-hint">支持 JPG、PNG 格式</span>
              </div>
            </el-upload>
            <div v-if="clazz.cover" class="cover-actions">
              <el-button type="danger" size="small" @click="clazz.cover = ''; fileList = [];">
                <el-icon style="margin-right: 4px;"><Close /></el-icon>
                移除图片
              </el-button>
            </div>
          </div>
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false; resetForm(clazzFormRef)" class="cancel-btn">
          <el-icon style="margin-right: 4px;"><Close /></el-icon>
          取消
        </el-button>
        <el-button type="primary" @click="save(clazzFormRef)" class="save-btn">
          <el-icon style="margin-right: 4px;"><Plus /></el-icon>
          保存案例
        </el-button>
      </div>
    </template>
  </el-dialog>
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

.batch-count {
  font-size: 12px;
  margin-left: 4px;
  font-weight: 600;
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

.search-item :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(45, 59, 53, 0.06);
  transition: all 0.3s ease;
  border: 1px solid var(--border);
  background: var(--bg-primary) !important;
  position: relative;
  overflow: hidden;
}

.search-item :deep(.el-select .el-input__wrapper::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.1), transparent);
  transition: left 0.6s ease;
  z-index: 1;
}

.search-item :deep(.el-select .el-input__wrapper:hover::before) {
  left: 100%;
}

.search-item :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(45, 59, 53, 0.1);
  border-color: var(--accent-light);
  transform: translateY(-1px);
}

.search-item :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 3px rgba(201, 169, 98, 0.15);
  border-color: var(--accent);
  transform: translateY(-1px);
}

.search-item :deep(.el-select .el-input__inner) {
  color: var(--text-primary);
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
  z-index: 2;
}

.search-item :deep(.el-select .el-input__inner::placeholder) {
  color: var(--text-muted);
}

.search-item :deep(.el-select .el-input__suffix-inner .el-input__icon) {
  color: var(--accent-dark);
  transition: all 0.2s ease;
  font-size: 16px;
  position: relative;
  z-index: 2;
}

.search-item :deep(.el-select .el-input__suffix-inner .el-input__icon:hover) {
  color: var(--accent);
  transform: rotate(180deg);
}

.search-item :deep(.el-select-dropdown) {
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(45, 59, 53, 0.15);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  overflow: hidden;
}

.search-item :deep(.el-select-dropdown__item) {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  line-height: 1.4;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 10px 16px;
  transition: all 0.2s ease;
}

.search-item :deep(.el-select-dropdown__item:hover) {
  background-color: rgba(201, 169, 98, 0.1);
  color: var(--accent-dark);
  transform: translateX(4px);
}

.search-item :deep(.el-select-dropdown__item.selected) {
  background-color: rgba(201, 169, 98, 0.2);
  color: var(--accent-dark);
  font-weight: 600;
}

.search-item :deep(.el-select-dropdown__item.hover) {
  background-color: rgba(201, 169, 98, 0.1);
  color: var(--accent-dark);
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

/* 表格中的图片样式 */
.table-cover {
  width: 60px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: 1px solid var(--border);
}

.table-cover:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cover-placeholder {
  width: 60px;
  height: 40px;
  border-radius: 6px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 11px;
  border: 1px dashed var(--border);
  transition: all 0.2s ease;
}

.cover-placeholder:hover {
  border-color: var(--accent);
  background: rgba(201, 169, 98, 0.05);
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

/* 状态样式 */
.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all 0.2s ease;
}

.status:hover {
  transform: translateY(-1px);
}

.status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(72, 187, 120, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
  }
}

.status-published {
  color: #48BB78;
}

.status-published::before {
  background: #48BB78;
}

.status-unpublished {
  color: #E53E3E;
}

.status-unpublished::before {
  background: #E53E3E;
  animation: pulse-danger 2s infinite;
}

@keyframes pulse-danger {
  0% {
    box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(229, 62, 62, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(229, 62, 62, 0);
  }
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
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 24px 48px rgba(45, 59, 53, 0.2),
    0 8px 20px rgba(45, 59, 53, 0.1),
    0 4px 12px rgba(45, 59, 53, 0.08);
  max-width: 640px;
  animation: dialogFadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transform-origin: center top;
  border: 1px solid rgba(201, 169, 98, 0.2);
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
  background: linear-gradient(135deg, #1E3A2F, #2D4A3F);
  padding: 24px 28px;
  margin: 0;
  border-bottom: none;
  position: relative;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.1);
}

:deep(.el-dialog__header::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.1), transparent);
  pointer-events: none;
}

:deep(.el-dialog__header::after) {
  content: '';
  position: absolute;
  top: -50%;
  right: -5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(201, 169, 98, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  transition: all 0.5s ease;
}

:deep(.el-dialog__title) {
  font-weight: 700;
  color: #ffffff;
  font-size: 20px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  display: inline-block;
}

:deep(.el-dialog__headerbtn) {
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-dialog__headerbtn:hover) {
  background: rgba(201, 169, 98, 0.2);
  transform: scale(1.05);
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

:deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #C9A962;
  transform: rotate(90deg) scale(1.15);
}

:deep(.el-dialog__body) {
  padding: 32px;
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
  padding: 24px 28px;
  border-top: 1px solid var(--border);
  background-color: var(--bg-secondary);
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  border-radius: 0 0 20px 20px;
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
.form-section:nth-child(2) { animation-delay: 0.25s; }
.form-section:nth-child(3) { animation-delay: 0.35s; }

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

/* 上传组件美化 */
.upload-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.avatar-uploader {
  cursor: pointer;
}

.cover-preview {
  width: 160px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 2px solid var(--border);
  transition: all 0.3s ease;
}

.cover-preview:hover {
  border-color: var(--accent);
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(201, 169, 98, 0.2);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 58, 47, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 13px;
  gap: 6px;
}

.cover-overlay .el-icon {
  font-size: 24px;
}

.cover-preview:hover .cover-overlay {
  opacity: 1;
}

.upload-placeholder {
  width: 160px;
  height: 120px;
  border-radius: 12px;
  border: 2px dashed var(--border);
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-placeholder:hover {
  border-color: var(--accent);
  background: rgba(201, 169, 98, 0.05);
  transform: scale(1.02);
}

.upload-icon {
  font-size: 32px;
  color: var(--accent);
  margin-bottom: 4px;
}

.upload-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.upload-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.cover-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 30px;
}

/* 底部按钮样式 */
.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  width: 100%;
}

.cancel-btn {
  min-width: 100px;
}

.save-btn {
  min-width: 120px;
}

/* 表单样式 */
:deep(.el-form-item) {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 13px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin-bottom: 8px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(45, 59, 53, 0.06);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  box-shadow: 0 4px 12px rgba(45, 59, 53, 0.1);
  border-color: var(--accent-light);
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 3px rgba(201, 169, 98, 0.15);
  border-color: var(--accent);
}

:deep(.el-select .el-input__wrapper) {
  cursor: pointer;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

:deep(.el-select-dropdown__item) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  transition: all 0.2s ease;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(201, 169, 98, 0.1);
  color: var(--accent-dark);
}

:deep(.el-select-dropdown__item.selected) {
  background-color: rgba(201, 169, 98, 0.2);
  color: var(--accent-dark);
  font-weight: 600;
}

/* 上传组件样式 */
:deep(.el-upload--picture-card) {
  border-radius: 12px;
  border: 2px dashed var(--border);
  transition: all 0.3s ease;
  background: var(--bg-secondary);
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-upload--picture-card:hover) {
  border-color: var(--accent);
  background: rgba(201, 169, 98, 0.05);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.2);
}

:deep(.el-upload-list__item) {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--border);
}

:deep(.el-upload-list__item:hover) {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

:deep(.el-upload-list__item-actions) {
  background: rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: all 0.3s ease;
}

:deep(.el-upload-list__item:hover .el-upload-list__item-actions) {
  opacity: 1;
}

:deep(.el-upload-list__item-action) {
  color: white;
  transition: all 0.2s ease;
}

:deep(.el-upload-list__item-action:hover) {
  color: var(--accent);
  transform: scale(1.1);
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(72, 187, 120, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
  }
}

@keyframes pulse-danger {
  0% {
    box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(229, 62, 62, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(229, 62, 62, 0);
  }
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 页面元素动画 */
.page-header {
  animation: fadeIn 0.4s ease forwards;
}

.search-container {
  animation: fadeIn 0.6s ease 0.1s forwards;
  opacity: 0;
}

.table-container {
  animation: fadeIn 0.4s ease 0.2s forwards;
  opacity: 0;
}

.header-left {
  animation: slideInLeft 0.5s ease forwards;
}

.header-right {
  animation: slideInRight 0.5s ease forwards;
}

/* 按钮动画 */
.el-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  z-index: 1;
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

/* 表单元素动画 */
:deep(.el-input),
:deep(.el-select),
:deep(.el-textarea) {
  transition: all 0.3s ease;
}

:deep(.el-form-item) {
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-header {
    padding: 28px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .header-icon {
    width: 52px;
    height: 52px;
  }
  
  .header-icon svg {
    width: 26px;
    height: 26px;
  }
  
  .search-item {
    min-width: 180px;
    max-width: 240px;
  }
  
  .el-table :deep(td) {
    padding: 14px;
    font-size: 12px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

@media (max-width: 992px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-left {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .search-items {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-item {
    min-width: 100%;
    max-width: 100%;
  }
  
  .toolbar-right {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .table-container {
    border-radius: 12px;
  }
  
  :deep(.el-dialog) {
    max-width: 90%;
    margin: 20px auto;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px;
  }
  
  .page-title {
    font-size: 22px;
  }
  
  .page-subtitle {
    font-size: 11px;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
  
  .header-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .search-container {
    padding: 20px 24px;
  }
  
  .header-right {
    flex-direction: column;
    gap: 8px;
  }
  
  .header-right .el-button {
    width: 100%;
    justify-content: center;
  }
  
  .action-btns {
    justify-content: center;
    gap: 6px;
  }
  
  .action-btn {
    width: 26px;
    height: 26px;
    font-size: 11px;
  }
  
  .el-table :deep(th) {
    padding: 12px 8px;
    font-size: 10px;
  }
  
  .el-table :deep(td) {
    padding: 12px 8px;
    font-size: 11px;
  }
  
  .table-cover {
    width: 50px;
    height: 35px;
  }
  
  .cover-placeholder {
    width: 50px;
    height: 35px;
    font-size: 10px;
  }
  
  .pagination-container {
    padding: 16px;
  }
  
  :deep(.el-dialog__body) {
    padding: 20px;
  }
  
  :deep(.el-dialog__footer) {
    padding: 16px;
  }
  
  :deep(.el-upload--picture-card) {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 20px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .search-container {
    padding: 16px 20px;
  }
  
  .section-label {
    font-size: 12px;
  }
  
  .el-button {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .table-header {
    padding: 16px 20px;
  }
  
  .table-title {
    font-size: 14px;
  }
  
  .el-table :deep(th) {
    padding: 10px 6px;
    font-size: 9px;
  }
  
  .el-table :deep(td) {
    padding: 10px 6px;
    font-size: 10px;
  }
  
  .tag {
    padding: 2px 6px;
    font-size: 10px;
  }
  
  .status {
    font-size: 10px;
  }
  
  :deep(.el-dialog) {
    max-width: 95%;
    margin: 10px auto;
  }
  
  :deep(.el-dialog__header) {
    padding: 16px 20px;
  }
  
  :deep(.el-dialog__title) {
    font-size: 16px;
  }
  
  :deep(.el-dialog__body) {
    padding: 16px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
  
  :deep(.el-upload--picture-card) {
    width: 60px;
    height: 60px;
  }
}

/* 搜索历史下拉 */
.search-history-dropdown {
  position: absolute;
  top: 100%;
  left: 24%;
  z-index: 100;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(45, 59, 53, 0.15);
  padding: 12px;
  min-width: 240px;
  max-width: 320px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.history-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-history {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 11px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-history:hover {
  background: rgba(229, 62, 62, 0.1);
  color: #E53E3E;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  font-size: 13px;
}

.history-item:hover {
  background: rgba(201, 169, 98, 0.1);
  color: var(--accent-dark);
  transform: translateX(4px);
}

.history-item .el-icon {
  font-size: 14px;
  color: var(--text-muted);
}

/* 清空输入图标 */
.clear-input {
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
}

.clear-input:hover {
  color: var(--accent-dark);
  transform: scale(1.1);
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>