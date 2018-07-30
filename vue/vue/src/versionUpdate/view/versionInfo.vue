<template>
    <div class="container">
        <img :src= "baseUrl + '/upload/zx_qrcode.png'">
        <div class="versionName">V{{versionName}}</div>
        <div @click="gotoVersionUpdate()" class="introduce">功能介绍>></div>
    </div>
</template>
<style scoped>
    .container {
        text-align: center;
    }
    .versionName {
        font-size: 20px;
        margin-top: 20px;
        margin-bottom: 20px;
    }
    .introduce {
        font-size: 15px;
        color: #37AEFF;
    }
    img {
        width: 150px;
        margin-top: 20px;
    }
</style>
<script>
    import util from 'Util';

    export default{
        beforeRouteEnter(to, from, next) {
            next(function (vm) {
                vm.init();
            });
        },

        data(){
            return{
                baseUrl: util.getServerUrl() + '/',
                versionName: '',
                clientType: 1
            }
        },
        methods: {
            init() {
                this.versionName = util.getRequestParam('versionName');
                this.clientType = util.getRequestParam('clientType');
            },
            gotoVersionUpdate() {
                this.$router.push({
                    name: 'versionUpdate'
                })
            }
        }
    }
</script>
