<template>
    <div>
        <div class="mint-content"
             style='top: 0px'>

             <div class="a_tip">
                 <a>恭喜您已经登录成功，请下载前往智信客户端登录使用。（如您未下载智信客户端，请先下载）</a>
             </div>
        </div>
    </div>
</template>

<style scoped>
    .a_tip{
        margin-left: 15px;
        margin-right: 15px;
        margin-top: 30px;
        color: #686868;
    }
</style>

<script>

import Util from 'Util'
import sysConfig from 'sysConfig'

export default {
    data() {
        return {
        }
    },
    components: {
    },
    computed: {
    },
    methods: {
        init() {

        },
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            vm.init()
        })
    }
}
</script>