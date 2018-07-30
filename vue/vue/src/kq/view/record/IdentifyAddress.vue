<template>
    <div>
        <mt-header fixed title="位置认证"></mt-header>
        <div class="mint-content soft-scrollable" :style="contentStyle">
            <div
                    v-infinite-scroll="loadData"
                    infinite-scroll-disabled="disableLoad"
                    infinite-scroll-distance="10"
                    infinite-scroll-immediate-check="false">
                <div class="headRows middleFont">
                    <div>请将<span class="textBlue">{{address}}</span>认证为：</div>
                    <div class="row center-child" @click="markWork(true)">
                        <i class="iconBg col-center" :class="[isMarkWork ? 'checkImg' : 'unCheckImg']"></i>
                        <span class="col-center addressType">工作地点</span>
                        <span class="col textGray smallFont">在此位置打卡直接为有效打卡</span>
                    </div>
                    <div @click="markWork(false)" class="row center-child">
                        <i class="iconBg col-center" :class="[isMarkWork ? 'unCheckImg' : 'checkImg']"></i>
                        <span class="col-center addressType">非工作地点</span>
                        <span class="col textGray smallFont">在此位置打卡需要提交情况说明，上级确定后为有效考勤记录</span>
                    </div>
                </div>
                <div class="inputDesc bdr-b bdr-t textGray">地点说明</div>
                <div style="background:white">
                <textarea
                        class="default"
                        placeholder="如东城现场、长沙办事处等"
                        rows="2"
                        v-model="addressDesc">
                </textarea>
                </div>
                <div class="row btnList">
                    <div class="col-60 confirmBtn" @click="confirm">确定</div>
                    <div class="cancelBtn col" @click="cancel">取消</div>
                </div>

                <check-list :dataList='dataList'></check-list>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .inputDesc {
        padding: 5px 10px;
    }

    .headRows {
        padding: 5px;
        background-color: white;
    }

    .headRows div {
        padding: 5px;
    }

    .addressType {
        width: 90px;
    }

    textarea {
        padding: 10px;
        margin-top: 0px;
    }

    .confirmBtn, .cancelBtn {
        padding: 0 30px;
        margin: 10px;
        border-radius: 4px;
        text-align: center;
        height: 40px;
        line-height: 40px;
    }

    .confirmBtn {
        background-color: #37AEFF;
        color: white;
    }

    .cancelBtn {
        background-color: white;
    }

    .btnList {
        padding: 10px;
    }

    .checkImg {
        background-image: url('../../image/icon_btn_check.png');
    }

    .unCheckImg {
        background-image: url('../../image/icon_btn_uncheck.png');
    }
</style>
<script>
    import Util from 'Util'
    import dateUtil from 'DateUtil'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import {Indicator, MessageBox, Toast} from 'mint-ui'
    import {bindNavBar} from 'egovanative'
    import {baseData, baseComputed, resolveHasMore, resolveResultData} from 'ListManager'
    import buildParser from './checkListItemParser'
    import CheckList from './widget/CheckList.vue'

    function defaultData() {
        return {
            ...baseData(),
            contentStyle: {top: Util.getHeaderHeight() + 'px'},
            address: '',
            dataList: [],
            clusterID: '',
            humanID: gData.humanID,
            isMarkWork: true,
            addressDesc: ''
        }
    }
    export default{
        data(){
            return defaultData()
        },
        methods: {
            markWork(isWorkPos) {
                this.isMarkWork = isWorkPos
            },
            loadData(isRefresh) {
                Indicator.open()
                http.ajax({
                    functionName: "/mi/cluster/getinversechecklog",
                    params: {
                        humanID: this.humanID,
                        clusterID: this.clusterID,
                        count: sysConfig.COUNT_PER_PAGE,
                        startNum: this.dataList.length,
                        status: 3//全部
                    },
                    success: (data) => {
                        buildParser(this)(isRefresh, data)
                    },
                    finally: () => {
                        Indicator.close()
                    }
                })
            },
            confirm() {
                this.markIdentifyFlag(this.isMarkWork, this.addressDesc)
            },
            cancel() {
                Util.goBack()
            },
            markIdentifyFlag(isWorkPlace, remarkContent) {
                if (isWorkPlace && !remarkContent) {
                    Toast('请填写地址说明')
                    return
                }
                Indicator.open()
                let flag = isWorkPlace ? 1 : 2;
                http.ajax({
                    functionName: "/mi/cluster/setidentifyflag",
                    params: {
                        seniorHumanID: gData.humanID,
                        humanID: this.humanID,
                        clusterID: this.clusterID,
                        remark: remarkContent,
                        identifyFlag: flag
                    },
                    success: (data) => {
                        if (data && data.success) {
                            this.identifyFlag = flag
                            Toast('认证成功!')
                            if (this.$route.params.callback) {
                                this.$route.params.callback()
                            }
                            Util.goBack()
                        } else if (data) {
                            Toast(`认证失败：${data.message}`)
                        }
                    },
                    finally: () => {
                        Indicator.close()
                    }
                })
            },
            initOnCreate() {
                Util.resetObject(this, defaultData())
                let params = this.$route.params
                if (!params) return

                this.humanID = params.humanID || gData.humanID

                let checkItem = params.checkItem
                this.clusterID = checkItem.clusterID
                this.loadData(true)

                this.address = checkItem.Address
            }
        },
        computed: {
            ...baseComputed,
            isSelf() {
                return this.humanID == gData.humanID
            }
        },
        components: {
            'check-list': CheckList
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.initOnCreate()
                bindNavBar('位置认证')
            })
        }
    }
</script>
