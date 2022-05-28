<template>
  <el-container class="home_container">
    <el-header>
      <div class="imgText">
        <img class="Img" src="../assets/image/logo.png" alt="" />
        <span class="spantext">后台管理系统</span>
      </div>
      <el-button class="loginoutBtn">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="collapse ? '64px': '200px'">
        <div class="toggle-button" @click="toggle">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="collapse"
          :collapse-transition="false"
          :default-active="activePath"
          router
        >
          <el-submenu :width="collapse ? '64px': '200px'" :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item 
                :index="'/'+ subItem.path" 
                v-for="subItem in item.children" 
                :key="subItem.id"
                @click="saveNavState('/'+ subItem.path)"
            >
                    <template slot="title">
                        <i class="el-icon-menu"></i>
                        <span>{{ subItem.authName }}</span>
                    </template>
            </el-menu-item>
          </el-submenu>

        </el-menu>
      </el-aside>

      <el-main>
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "home",
  data() {
    return {
        menuList:[],
        iconsObj:{
            '125':'iconfont icon-user',
            '103':'iconfont icon-tijikongjian',
            '101':'iconfont icon-shangpinguanli',
            '102':'iconfont icon-danju',
            '145':'iconfont icon-baobiao-xianxing'
        },
        collapse:false,
        activePath:'',//激活链接的地址
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if(res.meta.status !== 200) return this.$message.error('菜单栏获取失败')
        this.menuList = res.data
        console.log(this.menuList);
    },
    toggle(){
        this.collapse = !this.collapse
    },
    /* 菜单栏激活状态 */
    saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath)
        this.activePath = activePath
    }
  },
};
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
  .toggle-button{
      background-color: #4A5064;
      font-size: 10px;
      line-height: 24px;
      color: #fff;
      text-align: center;
      letter-spacing: 0.2rem;
      cursor: pointer;
  }
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  margin-top: -10px;
  font-size: 20px;
  .spantext {
    margin-top: 14px;
    margin-left: 15px;
  }
  > div {
    display: flex;
    align-items: center;
  }
  .Img {
    width: 40px;
    height: 40px;
    margin-top: 10px;
  }
  .loginoutBtn {
    margin-top: 10px;
  }
}
.el-aside {
  background-color: #333744;
  .el-menu{
      border-right: none;
  }
  .iconfont{
      margin-right: 10px;
  }
}
.el-main {
  background-color: #eaedf1;
}
</style>