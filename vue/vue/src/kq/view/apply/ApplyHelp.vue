<template>
    <div class="mint-content middlefont">
        <div style="padding:10px; background:white">
            <p class="title">出差：</p>
            <p>因公事，离开单位所在城市办事</p>
            <p class="title">公出：</p>
            <p>因公事，离开单位办事</p>
        </div>
    </div>
</template>
<style scoped>
    .title {
        font-weight: bold;
        font-size: 16px;
    }
</style>
<script>
    import Util from 'Util'
    import {bindNavBar} from 'egovanative'

    export default{
        methods: {
            goBack() {
                Util.goBack()
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                bindNavBar('出差申请帮助')
            })
        }
    }
</script>
