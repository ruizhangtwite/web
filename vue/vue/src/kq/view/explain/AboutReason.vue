<template>
    <div>
        <!--<mt-header fixed v-on:backClick="goBack" title="关于原因说明">-->
        <!--</mt-header>-->
        <div class="mint-content middlefont">
            <div style="padding:10px; background:white">
                <p class="title">关于未认证地点：</p>
                <p> 在未认证的地点打卡（签到/签退）超过一定次数，考勤将是位置异常，需要提交情况说明，上级领导同意后，该考勤记录恢复正常。</p>
                <p>当上级领导认证了该地点后，在此地点打卡则为正常。</p>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .mint-content {
        background-color: white;
    }
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
                bindNavBar('帮助')
            })
        }
    }
</script>
