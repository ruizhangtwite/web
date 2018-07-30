<template>
    <div class="mint-content">
        <div class="inputContainer">
            <mt-field label="手机号" placeholder="请输入手机号" v-model="phoneNum"></mt-field>
            <mt-field label="验证码" placeholder="请输入验证码" class="verifyCode" v-model="verifyCode">
                <mt-button @click.native="sendSMS" :disabled="disableSendVerify">{{sendVerifyBtnText}}</mt-button>
            </mt-field>
            <mt-field label="密码" placeholder="请输入密码" v-model="password" type="password"></mt-field>
            <mt-field label="确认密码" placeholder="请再次输入密码" v-model="passwordAgain" type="password"></mt-field>
        </div>
        <mt-button class="defaultBtn" type="default" @click.native="register">注册</mt-button>
    </div>
</template>
<style>
    .verifyCode .mint-field-other {
        position: relative;
        margin-left: 10px;
    }
</style>
<style scoped>
    .inputContainer {
        margin-top: 10px;
    }

    .verifyCode button {
        height: 30px;
        font-size: 15px;
        width: 84px;
    }

    .defaultBtn {
        margin-top: 20px;
    }
</style>
<script>
    import {Indicator, Toast} from 'mint-ui';
    import md5 from 'md5';
    import Util from 'Util'
    import http from 'Http'
    import {data as gData} from 'zhixin'

    export default {
        data() {
            return {
                phoneNum: '',
                password: '',
                passwordAgain: '',
                verifyCode: '',
                countDown: 0
            }
        },
        components: {},
        computed: {
            disableSendVerify() {
                return !this.phoneNum || this.countDown > 0
            },
            sendVerifyBtnText() {
                return this.countDown > 0 ? `${this.countDown}s` : '点击获取'
            }
        },
        methods: {
            init() {

            },
            register() {

            },
            sendSMS() {
                this.countDown = 60
                let interval = setInterval(()=> {
                    if (--this.countDown === 0) {
                        clearInterval(interval);
                    }
                }, 1000)
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.init()
            })
        }
    }
</script>