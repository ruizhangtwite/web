<template>
    <div>
        <mt-header fixed v-on:backClick="goBack" title="工时用户验证">
            <mt-button slot="right" @click.native="commit">提交</mt-button>
        </mt-header>
        <div class="mint-content">
            <div>
                <mt-field label="用户名" placeholder="请输入工时用户名" type="tel" v-model="phoneNum"></mt-field>
                <mt-field label="密码" placeholder="请输入工时密码" type="password" v-model="password"></mt-field>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .mint-content {
        padding-top: 10px;
    }
</style>
<script>
    import {Indicator} from 'mint-ui'
    import {Toast} from 'mint-ui'
    import {data as gData}  from 'zhixin'
    import http from 'Http'
    import {bindNavBar} from 'egovanative'
    import Util from 'Util'

    module.exports = {
        methods: {
            goBack() {
                Util.goBack()
            },
            commit() {
                if (!this.checkInputValid()) {
                    return
                }
                http.ajax({
                    functionName: "/login/verifygs",
                    params: {
                        humanID: gData.humanID,
                        humanName: this.phoneNum,
                        passWord: this.password
                    },
                    start: () => {
                        Indicator.open();
                    },
                    success: (data)=> {
                        if (data && data.resultInfo) {
                            var resultInfo = data.resultInfo
                            if (resultInfo.success) {
                                this.$store.commit('SET_IS_VERIFY', true)
                                var params = this.$route.params
                                if (params && params.callback) {
                                    params.callback()
                                }
                                Toast("验证成功")
                                this.goBack()
                            } else {
                                Toast("用户名或密码错误")
                            }
                        }
                    },
                    error: function (data) {
                        Toast("验证错误")
                    },
                    finally: ()=> {
                        Indicator.close()
                    }
                })
            },
            checkInputValid() {
                if (!this.phoneNum) {
                    Toast("用户名不能为空！")
                    return false
                }
                if (!this.password) {
                    Toast("密码不能为空！")
                    return false
                }
                return true
            }
        },
        data() {
            return {
                phoneNum: '',
                password: ''
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                vm.phoneNum = gData.humanName
                vm.password = ''
                bindNavBar('工时用户验证', '提交', () => {
                    vm.commit()
                })
            })
        }
    }
</script>
