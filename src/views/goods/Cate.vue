<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
        <el-row>
            <el-col>
                <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
            </el-col>
        </el-row>

        <tree-table 
            :data="cateList"
            :columns="columns"
            :selection-type="false"
            :expand-type="false"
            show-index
            border
            class="treeTable"
        >
            <template slot="isok" slot-scope="scope">
                <i class="el-icon-success" v-if="scope.row.cat_deleted === false"
                style="color:lightgreen"></i>
                <i class="el-icon-error" v-else
                 style="color:red"></i>
            </template>

            <template slot="order" slot-scope="scope">
                <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                <el-tag type="warning" size="mini" v-else>三级</el-tag>
            </template>

            <template slot="opt" slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </template>
        </tree-table>

        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[3, 5, 10, 15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>

        <el-dialog
            title="添加分类"
            :visible.sync="addCatedialogVisible"
            width="50%"
        >
            <el-form 
                :model="addCateForm" 
                :rules="addCateFormRules" 
                ref="addCateFormRef" 
                label-width="100px" 
            >
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                   <el-cascader
                    v-model="value"
                    :options="parentCateList"
                    :props="cascaderProps"
                    @change="handleChange">
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCatedialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCatedialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "cate",
  data() {
    return {
        /* 分页查询条件 */
        queryInfo:{
            type:3,
            pagenum:1,
            pagesize:5
        },
        cateList:[],//商品分类数据
        total:0,//总条数
        addCatedialogVisible:false,//控制添加分类对话框显示隐藏
        addCateForm:{
            cat_name:'',
            cat_pid:0,
            cat_level:0
        },//分类表单数据
        //table定义列
        columns:[
            {
                label:'分类名称',
                prop:'cat_name'
            },
            {
                label:'是否有效',
                type: 'template',//标示将当前列定义为模板列
                template: 'isok',//当前列的名称
            },
            {
                label:'排序',
                type: 'template',//标示将当前列定义为模板列
                template: 'order',//当前列的名称
            },
            {
                label:'操作',
                type: 'template',//标示将当前列定义为模板列
                template: 'opt',//当前列的名称
            }
        ],
        addCateFormRules:{
            cat_name:[
                {
                    required:true,
                    message:'请输入分类名称',
                    trigger:'blur'
                }
            ]
        },
        parentCateList:[],
        cascaderProps:{
            value:'cat_id',
            label:'cat_name',
            children:'children'
        },//级联选择器的配置选项
        selectedKeys:[]
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
      /* 获取商品分类数据 */
    async getCateList(){
        const {data:res} = await this.$http.get('categories',{
            params:this.queryInfo
        })
        if(res.meta.status !== 200) return this.$message.eror('商品列表获取失败')
        this.cateList = res.data.result
        this.total = res.data.total
    },
    /* 监听pagesize改变事件 */
    handleSizeChange(newSize){
        this.queryInfo.pagesize = newSize
        this.getCateList()
    },
    /* 监听页码变化 */
    handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage
        this.getCateList()
    },
    /* 添加分类的弹出框 */
    showAddCateDialog(){
        this.getParentCateList()//先获取分级分类的数据列表
        this.addCatedialogVisible = true
    },
    async getParentCateList(){
        const{data:res1} = await this.$http.get('categories',{params:{type:2}})
        if(res1.meta.status !== 200){
            return this.$message.error('获取分类失败')
        }
        this.parentCateList = res1.data
        console.log(this.parentCateList)
    },
    /* 选中后的值 */
    parentCateChanged(){

    }
  }
};
</script>

<style lang="less" scoped>
.treeTable{
    margin-top:15px
}
</style>