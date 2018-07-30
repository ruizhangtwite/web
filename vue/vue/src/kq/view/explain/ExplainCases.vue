<template>
    <div>
        <mt-header fixed title="情况说明">
            <mt-button slot="right" @click.native="goHistory">全部记录</mt-button>
        </mt-header>
        <div class="mint-content soft-scrollable">
            <div class="sectionEmpty" v-if="dataEmpty">
                没有数据
            </div>
            <div class="section" v-if="pendingList.length > 0">
                <div class="section-header bdr-t bdr-b">{{pendingTitle}}</div>
                <div class="flowContainer bdr-b">
                    <div v-for="item in pendingList" class="flowItem" @click="clickPendingItem(item)">
                        {{item.checkDate}}({{item.explainTypeName}})
                    </div>
                </div>
            </div>
            <div class="section" v-if="needMyReplyList.length > 0">
                <div class="section-header bdr-t bdr-b">{{needMyReplyTitle}}</div>
                <explain-list :dataList="needMyReplyList" v-on:onItemDelete="onItemDelete()"></explain-list>
            </div>
            <div class="section" v-if="processingList.length > 0">
                <div class="section-header bdr-t bdr-b">待审批</div>
                <explain-list :dataList="processingList" v-on:onItemDelete="onItemDelete()"></explain-list>
            </div>
        </div>
    </div>
</template>
<style scoped>
</style>
<script>
    import {Indicator} from 'mint-ui'
    import {Toast} from 'mint-ui'
    import {resolveResultData, refreshAsNeed} from '../TabManager'

    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'

    import {bindNavBar} from 'egovanative'
    import {caseParser, parseCheckLog} from './parser'
    import ExplainList from './ExplainList.vue'

    export default{
        data () {
            return {
                pendingList: [],//需要说明
                needMyReplyList: [],//需要我审批
                processingList: [],//我提交的需要他人审批的
                isLoading: true
            }
        },
        methods: {
            goHistory() {
                this.$router.push({
                    name: 'explainHistory'
                })
            },
            onItemDelete() {
                this.getDataList()
            },
            clickPendingItem(item) {
                this.$router.push({
                    name: 'editExplain',
                    params: {
                        ...item,
                        callback: (id)=> {
                            this.getDataList()
                        }
                    }
                })
            },
            getDataList() {
                Indicator.open()
                this.isLoading = true
                http.ajax({
                    functionName: "/mi/explain/getpengdingorcheckexplainlist",
                    params: {
                        humanID: gData.humanID
                    },
                    success: (data) => {
                        if (data && data.success && data.data) {
                            data = data.data
                            if (data.pengdingList) {
                                this.pendingList = data.pengdingList
                            }

                            if (data.replayExplainList) {
                                data.replayExplainList.map(item => caseParser.call(this, item))
                                this.needMyReplyList = data.replayExplainList
                            }

                            if (data.myExplainList) {
                                data.myExplainList.map(item => caseParser.call(this, item))
                                this.processingList = data.myExplainList
                            }
                        } else {
                            Toast("获取列表失败")
                        }
                    },
                    finally: () => {
                        Indicator.close()
                        this.isLoading = false
                    }
                })
            }
        },
        computed: {
            pendingTitle() {
                return Util.formatTitle('我需要说明的考勤', this.pendingList.length)
            },

            needMyReplyTitle() {
                return Util.formatTitle('待我审批', this.needMyReplyList.length)
            },
            dataEmpty() {
                return (this.pendingList.length + this.processingList.length + this.needMyReplyList.length == 0)
                        && !this.isLoading
            }
        },
        components: {
            'explain-list': ExplainList
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                bindNavBar('情况说明', '全部记录', () => {
                    vm.goHistory()
                })
            })
        },
        mounted() {
            this.getDataList()
        }
    }
</script>
