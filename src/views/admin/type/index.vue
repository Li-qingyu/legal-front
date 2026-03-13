<script setup>
import {ref,onMounted} from 'vue'
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

//查询
const search = async()=>{
  const result =await queryAllApi();
  if(result.code){
    deptList.value=result.data;
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
  <h3>法律类型管理</h3>
  <div class="container">
    <el-input v-model="searchKeyword" placeholder="搜索法律类型..." style="width: 300px; margin-right: 10px;"></el-input>
    <el-button type="primary" @click="search">搜索</el-button>
    <el-button type="primary" plain @click="addDept" style="margin-left: 10px;">添加法律类型</el-button>
  </div>
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
      <el-table-column type="index" label="ID" width="80" align="center" />
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
.container{
  margin: 20px 0;
}
</style>
