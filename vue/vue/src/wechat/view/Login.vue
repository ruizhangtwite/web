<template>
    <div class="mint-content">
        <div class="fieldContainer">
            <mt-field label="用户名" placeholder="请输入用户名或手机号" v-model="inputName"></mt-field>
            <mt-field label="密码" placeholder="请输入密码" v-model="inputPassword"></mt-field>
        </div>

        <mt-button class="defaultBtn" type="default" @click.native="login">登录</mt-button>

        <div class="middleFont textGray regNav">
            <span>如您没有有智信账号，请</span>
            <span class="textBlue"
                  @click="goRegister()">点击此处注册</span>
        </div>
    </div>

</template>
<style scoped>
    .fieldContainer {
        margin-top: 10px;
    }

    .defaultBtn {
        margin-top: 20px;
    }

    .regNav {
        margin-top: 20px;
        text-align: center;
    }


</style>
<script>
    import {Indicator, Toast} from 'mint-ui';
    import md5 from 'md5';
    import Util from 'Util'
    import http from 'Http'
    import {data as gData} from 'zhixin'

    function defaultData() {
        return {
            inputName: "egova",
            inputPassword: ""
        }
    }
    export default {
        data() {
            return defaultData()
        },
        methods: {
            init() {
                Util.resetObject(vm, defaultData())
            },
            login(){
                let name = this.inputName;
                if (!name) {
                    Toast("用户名不能为空")
                    return
                }

                let password = this.inputPassword;
                if (gData.userID) {
                    password = md5(gData.userID + password);
                } else if (password) {
                    password = md5(password);
                }

                http.ajax({
                    functionName: "humanLogin_ZX",
                    methodName: '/main/mobilesys/login',
                    params: {
                        userID: gData.userID ? gData.userID : '',
                        userName: name,
                        password: password,
                    },
                    success: (data) => {
                        if (data) {
                            if (data.success) {
                                this.$router.push({
                                    name: 'caseList',
                                })
                            } else if (data.code == 2) {
                                gData.userID = data.message
                                this.login()
                            } else {
                                alert(data.message)
                            }
                        }
                    },
                    finally: () => {
                        Indicator.close()
                    }
                })
            },
            goRegister() {
                this.$router.push({
                    name: 'register'
                })
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (vm.isNewPage(to)) {
                    vm.init()
                }
            })
        }
    }
</script>