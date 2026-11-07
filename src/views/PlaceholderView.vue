<template>
  <el-empty :description="`${$route.meta.title || '该页面'}待开发，敬请期待`">
    <el-button type="primary" @click="$router.push('/items')">
      先去管理物品
    </el-button>
  </el-empty>
</template>
