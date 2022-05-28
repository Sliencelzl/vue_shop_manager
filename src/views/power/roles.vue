<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['botBottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete">删除</el-button>
            <el-button @click="showSetRightDialog(scope.row)" type="warning" icon="el-icon-setting"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
        title="权限分配"
        :visible.sync="setRightdialogVisible"
        width="30%"
        @close="serRightDialogClosed"
    >
  <el-tree 
    :data="rightslist" 
    :props="treeProps"
    show-checkbox
    node-key="id"
    default-expand-all
    :default-checked-keys="defKeys"
    ref="treeRef"
  >
  </el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRightdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
</el-dialog>

  </div>
</template>

<script>
export default {
  name: "roles",
  data() {
    return {
      rolesList: [],
      rightslist:[],
      roleId:'',//将要分配权限的id
      defKeys:[],//默认选中的节点
      setRightdialogVisible:false,//分配权限对话框显示隐藏
      treeProps:{
          label:'authName',
          children:'children'
      }//树形控件
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取权限列表失败");
      this.rolesList = res.data;
    },
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => {
        return err;
      });
      if (confirmResult !== "confirm") {
        return this.$message.info("取消删除");
      }
      const { data: res1 } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res1.meta.status !== 200) {
        return this.$message.error("权限删除失败");
      }
      role.children = res1.data;
    },
    /* 权限分配对话框 */
    async showSetRightDialog(role){
        this.roleId = role.id
        /* 获取权限数据 */
        const { data:res1 } =  await this.$http.get('rights/tree')
            if(res1.meta.status !== 200) {
                return this.$message.error('权限数据获取失败')
            }
        this.rightslist = res1.data
        console.log(this.rightslist)
        this.getLeafKeys(role,this.defKeys)
        this.setRightdialogVisible = true
    },
    /* 递归获取角色下所有三级目录 */
    getLeafKeys(node,arr){
        if(!node.children){
            return arr.push(node.id)
        }
        node.children.forEach(item=>{
            this.getLeafKeys(item,arr)
        })
    },
    serRightDialogClosed(){
        this.defKeys = []
    },
    async allotRights(){
        const keys = [
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const {data:res2} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
        if(res2.meta.status !== 200){
            return this.$message.error('分配角色权限失败')
        }
    this.$message.success('分配权限成功')
    this.getRolesList()
    this.setRightdialogVisible =false
    }
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.botBottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>