<template>
    <div>
        <mt-header fixed title="考勤申请">
            <mt-button slot="right" @click.native="goHistory">全部记录</mt-button>
        </mt-header>
        <div class="mint-content soft-scrollable">
            <div class="sectionEmpty" v-if="dataEmpty">
                没有数据
            </div>
            <div class="section" v-if="pendingList.length > 0">
                <div class="section-header bdr-t bdr-b">{{pendingTitle}}</div>
                <apply-list :dataList="pendingList"></apply-list>
            </div>

            <div class="section" v-if="processingList.length > 0">
                <div class="section-header bdr-t bdr-b">正在进行</div>
                <apply-list :dataList="processingList"></apply-list>
            </div>
        </div>
        <div class="bottomSection bdr-t flex center-child center-content" @click="addApply">
            <i class="col-center bottomBtnImg chun-more"></i>
            <span class="col-center">新增</span>
        </div>
    </div>
</template>
<style scoped>
    .mint-content {
        bottom: 48px;
    }
</style>
<script>
    import {Indicator} from 'mint-ui';
    import {Toast} from 'mint-ui';
    import {resolveResultData, refreshAsNeed} from '../TabManager'

    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'

    import {bindNavBar} from 'egovanative'
    import {parseItem} from './parser'
    import ApplyList from './ApplyList.vue'

    export default{
        data () {
            return {
                pendingList: [],//待我审批
                processingList: [],
                isLoading: true
            }
        },
        methods: {
            goHistory() {
                this.$router.push({
                    name: 'travelApplyHistory'
                })
            },

            getDataList() {
                Indicator.open()
                this.isLoading = true
                http.ajax({
                    functionName: "/mi/checkapply/getpengdingorprocessinglist",
                    params: {
                        humanID: gData.humanID,
                    },
                    success: (data) => {
                        if (data && data.success && data.data) {
                            data = data.data
                            if (data.pengdingList) {
                                data.pengdingList.map(item => parseItem.call(this, item))
                                this.pendingList = data.pengdingList
                            }
                            if (data.processingList) {
                                data.processingList.map(item => parseItem.call(this, item))
                                this.processingList = data.processingList
                            }
                        } else {
                            Toast("获取列表失败")
                        }
                    },
                    finally:() => {
                        Indicator.close()
                        this.isLoading = false
                    }
                })
            },
            addApply() {
                this.$router.push({
                    name: "addApply",
                    params: {
                        callback: ()=> {
                            this.getDataList(true)
                        }
                    }
                })
            }
        },
        computed: {
            pendingTitle() {
                return Util.formatTitle('待我审批', this.pendingList.length)
            },
            dataEmpty() {
                return (this.pendingList.length + this.processingList.length == 0) && !this.isLoading
            }
        },
        components: {
            'apply-list': ApplyList
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                bindNavBar('考勤申请', '全部记录', () => {
                    vm.goHistory()
                })
            })
        },
        mounted() {
            this.getDataList()
        }
    }
</script>
