<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="quertInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="AddDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <el-table :data="userList" border stripe>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="showEditDialog(scope.row.id)"
              >修改</el-button
            >
            <el-button 
              type="danger" 
              icon="el-icon-delete" 
              size="small"
              @click="removeUserById(scope.row.id)"
              >删除</el-button
            >
            <el-button type="warning" icon="el-icon-setting" size="small"
              >分配角色</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页列表 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="quertInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="quertInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="AddDialogVisible"
        width="30%"
        @close="addDialogClosed"
      >
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
          class="demo-ruleForm"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="AddDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="30%"
        @close="editDialogClosed"
      >
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名" >
            <el-input disabled v-model="editForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="EditUserInfo"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "users",
  data() {
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/;
      if (regEmail.test(value)) {
        return cb();
      } else {
        cb(new Error("请输合法邮箱"));
      }
    };
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[34578]\d{9}$/;
      if (regMobile.test(value)) {
        return cb();
      } else {
        cb(new Error("请输入合法的手机号码"));
      }
    };
    return {
      /* 获取用户列表参数对象 */
      quertInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      userList: [],
      total: 0,
      AddDialogVisible: false, //弹出框的显示隐藏
      editDialogVisible:false,//修改用户弹出框的显示隐藏
      editForm:{},//查询到的用户信息对象
      /* 表单字段 */
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      /* 验证规则 */
      addFormRules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur",
          },
          {
            min: 3,
            max: 10,
            message: "用户名在3-10之间",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "请输入用户密码",
            trigger: "blur",
          },
          {
            min: 6,
            max: 15,
            message: "用户名在6-15之间",
            trigger: "blur",
          },
        ],
        email: [
          {
            required: true,
            message: "请输入用户邮箱",
            trigger: "blur",
          },
          {
            min: 6,
            max: 20,
            message: "用户名在6-15之间",
            trigger: "blur",
          },
          {
            validator: checkEmail,
            trigger: "blur",
          },
        ],
        mobile: [
          {
            required: true,
            message: "请输入用户手机号",
            trigger: "blur",
          },
          {
            min: 6,
            max: 15,
            message: "用户名在6-15之间",
            trigger: "blur",
          },
          {
            validator: checkMobile,
            trigger: "blur",
          },
        ],
      },
      editFormRules:{
        email:[
           {
            required: true,
            message: "请输入用户邮箱",
            trigger: "blur",
          },
          {
            min: 6,
            max: 20,
            message: "用户名在6-15之间",
            trigger: "blur",
          },
          {
            validator: checkEmail,
            trigger: "blur",
          },
        ],
        mobile:[
           {
            required: true,
            message: "请输入用户手机号",
            trigger: "blur",
          },
          {
            min: 6,
            max: 15,
            message: "用户名在6-15之间",
            trigger: "blur",
          },
          {
            validator: checkMobile,
            trigger: "blur",
          },
        ]
      }
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.quertInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.fail("用户列表获取失败");
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.quertInfo.pagesize = newSize;
      this.getUserList();
    },
    handleCurrentChange(newPage) {
      this.quertInfo.pagenum = newPage;
      this.getUserList();
    },
    /* 用户状态 */
    async userStateChanged(userInfo) {
      const { data: res1 } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res1.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error("状态更新失败");
      } else {
        this.$message.success("状态更新成功");
      }
    },
    /* 重置表单 */
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    /* 点击新添加用户预校验 */
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res2 } = await this.$http.post("users", this.addForm);
        if (res2.meta.status !== 201) {
          this.$message.error("用户添加失败");
        } else {
          this.$message.success("用户新增成功");
          this.AddDialogVisible = false;
          this.getUserList();
        }
      });
    },
    /* 修改用户 */
    async showEditDialog(id) {
      this.editDialogVisible = true
      const { data:res3 } = await this.$http.get('users/' + id)
      if(res3.meta.status !== 200){
        return this.$message.error('查询用户失败')
      }
      this.editForm = res3.data
    },
    /* 监听修改用户对话框的关闭事件 */
    editDialogClosed(){
      this.$refs.editFormRef.resetFields();
    },
    /* 修改用户信息并提交 */
    EditUserInfo(){
      this.$refs.editFormRef.validate(async valid => { 
        if(!valid) return
        const { data:res4 } = await this.$http.put('users/' + this.editForm.id,{
          email:this.editForm.email,
          mobile:this.editForm.mobile
        })

        if(res4.meta.status !== 200){
          return this.$message.error('更新用户失败')
        }
          this.editDialogVisible = false
          this.$message.success('更新用户成功')
          this.getUserList()
        
      })
    },
    /* 根据id删除用户信息 */
    async removeUserById(id){
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(err => {
        return err
      })
      if(confirmResult !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      const { data:res5} = await this.$http.delete('users/' + id)
      if(res5.meta.status !== 200){
        return this.$message.error('删除用户成功')
      }
      this.$message.success('用户删除成功')
      this.getUserList()
    }
  },
};
</script>

<style>
</style>