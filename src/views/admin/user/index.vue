<script setup>
import { onMounted, ref } from 'vue'
import { queryPageApi , addApi, queryInfoApi, updateApi, deleteApi} from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'


//搜索表单对象
let searchStu = ref({name: ''}) 
//列表展示数据
let tableData = ref([])

//钩子函数 - 页面加载时触发
onMounted(() => {
  queryPage()
})


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
    tableData.value = result.data.rows
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
let labelWidth = ref(100) //form表单label的宽度
let formTitle = ref('') //表单的标题
let stu = ref({ //用户对象-表单数据绑定
  name: '',
  email: '',
  phone: '',
  status: 1
})

//清空表单
const clearStu = () => {
  stu.value = {
    name: '',
    email: '',
    phone: '',
    status: 1
  }
}

//新增用户
const addStu = () => {
  dialogFormVisible.value = true
  formTitle.value = '新增用户'
  clearStu()
}

//修改用户
const updateStu = async (id) => {
  clearStu()
  dialogFormVisible.value = true
  formTitle.value = '修改用户'
  let result = await queryInfoApi(id)
  if(result.code){
    stu.value = result.data
  }
}

//表单校验规则
const stuFormRef = ref()
const rules = ref({
  name: [
    { required: true, message: '用户名为必填项', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为2-20个字', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱为必填项', trigger: 'blur' },
    { type: 'email', message: '请输入合法的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '手机号为必填项', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/g, message: '请输入合法的手机号', trigger: 'blur' }
  ]
})

//重置表单
const resetForm = (stuForm) => {
  if (!stuForm) return
  stuForm.resetFields()
}

//-------------保存用户信息 
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


//------- 删除用户
//根据ID删除单个用户
const delById = async (id) => {
  ElMessageBox.confirm('您确认删除此用户吗?' , '删除用户', {confirmButtonText:'确认', cancelButtonText:'取消', type:'warning'})
    .then(async () => {
      let result =  await deleteApi(`${id}`)
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

//批量删除用户
const delByIds = async () => {
  ElMessageBox.confirm('您确认删除选中的用户吗?' , '批量删除', {confirmButtonText:'确认', cancelButtonText:'取消',type:'warning'})
    .then(async () => {
      let result =  await deleteApi(selectIds.value.join(','))
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

//禁用用户
const disableUser = async (id) => {
  ElMessageBox.confirm('您确认禁用此用户吗?' , '禁用用户', {confirmButtonText:'确认', cancelButtonText:'取消', type:'warning'})
    .then(async () => {
      // 这里需要实现禁用功能
      ElMessage.success('禁用成功')
      queryPage()
    }).catch(() => {
      ElMessage.info('取消禁用')
    })
}

//启用用户
const enableUser = async (id) => {
  ElMessageBox.confirm('您确认启用此用户吗?' , '启用用户', {confirmButtonText:'确认', cancelButtonText:'取消', type:'warning'})
    .then(async () => {
      // 这里需要实现启用功能
      ElMessage.success('启用成功')
      queryPage()
    }).catch(() => {
      ElMessage.info('取消启用')
    })
}
</script>

<template>
    <!-- 顶部标题 -->
    <div>
      <div id="title">用户管理</div><br>
    </div>

    <!-- 条件搜索表单 -->
    <el-form :inline="true" :model="searchStu" class="demo-form-inline">
      <el-form-item label="用户名">
        <el-input v-model="searchStu.name" placeholder="搜索用户..."/>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="queryPage()">搜索</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 功能按钮 -->
    <el-button type="success" @click="addStu();resetForm(stuFormRef)">添加用户</el-button>
    <br><br>
    
    
    <!-- 列表展示 -->
    <el-table :data="tableData" border style="width: 100%" fit @selection-change="handleSelectionChange">
      <el-table-column type="selection"  align="center" width="35" />
      <el-table-column prop="id" label="ID" align="center" width="50px" />
      <el-table-column prop="name" label="用户名" align="center" width="100px" />
      <el-table-column prop="email" label="邮箱" align="center" width="200px"/>
      <el-table-column prop="phone" label="手机号" align="center" width="130px"/>
      <el-table-column prop="status" label="状态" align="center" width="80px" >
        <template #default="scope">
          {{ scope.row.status == 1 ? '启用': '禁用' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" @click="updateStu(scope.row.id) ;resetForm(stuFormRef)">编辑</el-button>
          <el-button type="danger" size="small" @click="delById(scope.row.id)">删除</el-button>
          <el-button v-if="scope.row.status == 1" type="warning" size="small" @click="disableUser(scope.row.id)">禁用</el-button>
          <el-button v-else type="success" size="small" @click="enableUser(scope.row.id)">启用</el-button>
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



  
  <!-- 新增/修改用户对话框 -->
  <el-dialog v-model="dialogFormVisible" :title="formTitle" width="50%">
    <el-form :model="stu" ref="stuFormRef" :rules="rules">
      <!-- 第一行 -->
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户名" :label-width="labelWidth" prop="name">
            <el-input v-model="stu.name" placeholder="请输入用户名"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" :label-width="labelWidth" prop="email">
            <el-input v-model="stu.email" placeholder="请输入邮箱"/>
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 第二行 -->
      <el-row>
        <el-col :span="12">
          <el-form-item label="手机号" :label-width="labelWidth"  prop="phone">
            <el-input v-model="stu.phone" placeholder="请输入手机号"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" :label-width="labelWidth">
            <el-select v-model="stu.status" placeholder="请选择" style="width: 100%;">
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
            </el-select>
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


  <!-- 违纪处理 -->

</template>


<style scoped>
#title {
  font-size: 20px;
  font-weight: 600;
}
</style>