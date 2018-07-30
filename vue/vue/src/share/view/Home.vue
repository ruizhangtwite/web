<template>
    <div>
        <div class="mint-content"
             style='top: 0px'>
            <div class='segmentCss'
                 v-show="register_show">
                <table>
                    <tr>
                        <td style="widht:80px;">电话号码</td>
                        <td>
                            <input type="text" />
                        </td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>验证码</td>
                        <td>
                            <input type="text" />
                            <input style="width:80px;"
                                   type="button"
                                   @click="sendSMS()"
                                   value="点击获取" />
                        </td>
                    </tr>
                    <tr>
                        <td>密码</td>
                        <td>
                            <input type="password" />
                        </td>
                    </tr>
                    <tr>
                        <td>确认密码</td>
                        <td>
                            <input type="password" />
                        </td>
                    </tr>
                </table>
            </div>
    
            <div class='segmentCss'
                 style="height:90px;"
                 v-show="login_show">
                <table>
                    <tr>
                        <td>电话号码</td>
                        <td>
                            <input type="text" />
                        </td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>密码</td>
                        <td>
                            <input type="password" />
                        </td>
                    </tr>
                </table>
            </div>
    
            <div style="display: flex;justify-content: center;">
                <button @click="register()" v-show="register_show"
                        class="button_register">注册</button>
                <button @click="login()" v-show="login_show"
                        class="button_register">登录</button>
            </div>
            <div style="margin-top:10px;display: flex;justify-content: center;" v-show="register_show">
                <a class="a_tip"
                   style="color:#686868;">如您已有智信账号，请</a><a class="a_tip"
                   @click="gotoLogin()"
                   style="color:#37AEFF">点击此处登录</a>
            </div>

            <div style="margin-top:10px;display: flex;justify-content: center;" v-show="login_show">
                <a class="a_tip"
                   style="color:#686868;">如您没有有智信账号，请</a><a class="a_tip"
                   @click="gotoLogin()"
                   style="color:#37AEFF">点击此处注册</a>
            </div>

        </div>
    </div>
</template>
<style scoped>
.segmentCss {
    margin-top: 30px;
    height: 150px;
    font-size: 15px;
    display: flex;
    justify-content: center;
    border-color: #eaeaea;
    border-width: 1px;
}

.button_register {
    color: #ffffff;
    background-color: #37AEFF;
    font-size: 15px;
    width: 100px;
}

.a_tip {
    font-size: 12px;
}
</style>
<script>
import { Navbar, TabItem, Indicator, MessageBox, Toast, TabContainer, TabContainerItem } from 'mint-ui';

import Util from 'Util'
import dateUtil from 'DateUtil'
import http from 'Http'
import sysConfig from 'sysConfig'

export default {
    data() {
        return {
            register_show: true,
            login_show: false
        }
    },
    components: {
    },
    computed: {
    },
    methods: {
        init() {

        },
        register() {

        },
        sendSMS() {

        },
        showLogin() {

        },
        gotoLogin() {
            if (this.register_show) {
                this.register_show = false;
                this.login_show = true;
            }
            else {
                this.register_show = true;
                this.login_show = false;
            }
        }
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            vm.init()
        })
    }
}
</script>