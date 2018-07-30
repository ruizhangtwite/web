<template>
    <div class="mint-content middleFont">
        <table class="content">
            <tr v-for="item in tableContent">
                <td class="infoTd">{{item.key}}</td>
                <td>{{item.value}}</td>
            </tr>
        </table>
        <grid-view :childWidth="75" :minGap="10">
            <div v-for="(item, index) in mediaList">
                <img :src="item.url"/>
                <div class="imgInfo">[{{item.mediausage}}]</div>
            </div>
        </grid-view>
        <div class="bottomBtns bdr-t row">
            <div class="button col" @click="vcClick()">{{isVerify ? '核实' : '核查'}}</div>
            <div class="button col" @click="chatClick()">发起讨论</div>
        </div>
    </div>

</template>
<style scoped>
    .bottomBtns {
        position: fixed;
        bottom: 0;
        margin-left: -10px;
        border-top: 1px solid #6096C2;
    }

    .bottomBtns .button {
        height: 40px;
        background-color: white;
        line-height: 40px;
        text-align: center;
    }

    .bottomBtns .button:first-child {
        border-right: 1px solid #6096C2;
    }

    .mint-content {
        padding: 10px 10px 50px 10px;
    }

    .grid {
        margin-top: 10px;
        padding: 0 10px 10px 10px;
    }

    .grid > div {
        margin-top: 10px;
    }

    .grid img {
        background-color: #aaa;
        width: 100%;
    }

    .content, .grid {
        background-color: white;
        border-radius: 5px;
        border: #888 solid 1px;
        display: block;
    }

    .infoTd {
        width: 75px;
        color: #929292;
    }

    .imgInfo {
        width: 100%;
        text-align: center;
        margin-top: 5px;
    }
</style>
<script>
    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import {bindNavBar} from 'egovanative'

    import {Indicator, Toast} from 'mint-ui'
    import GridView from '../../libs/widget/GridView.vue'

    const TASK_TYPE_VERIFY = 2;//核实
    const TASK_TYPE_CHECK = 3;//核查

    function defaultData() {
        return {
            isLoading: true,
            taskItem: {},
            tableContent: [],
            mediaList: [{
                url: 'https://img1.doubanio.com/icon/u2160581-37.jpg',
                mediausage:'上报'
            }, {
                url: 'https://img1.doubanio.com/icon/u2160581-37.jpg',
                mediausage:'上报'
            }, {
                url: 'https://img1.doubanio.com/icon/u2160581-37.jpg',
                mediausage:'位置图'
            }, {
                url: 'https://img1.doubanio.com/icon/u2160581-37.jpg',
                mediausage:'位置图'
            }]
        }
    }
    export default{
        data(){
            return defaultData()
        },
        computed: {
            isEmpty() {
                return !this.isLoading && this.dataList.length == 0
            },
            isVerify() {
                return this.taskItem.tasktype == TASK_TYPE_VERIFY
            },
            mediaGap() {
                let width = window.innerWidth - 32
                let num = Math.floor(width / 85)
                return {num, gap: Math.floor((width - num * 85) / (num - 1))}
            }
        },
        methods: {
            init() {
                let taskItem = this.taskItem = this.$route.params.obj || {}
                this.tableContent = [
                    {
                        key: '任务号',
                        value: taskItem.recid
                    },
                    {
                        key: '案件号',
                    },
                    {
                        key: '问题类型',
                        value: taskItem.eventtypename
                    },
                    {
                        key: '大类名称',
                        value: taskItem.maintypename
                    },
                    {
                        key: '小类名称',
                    },
                    {
                        key: '子类名称',
                    },
                    {
                        key: '微类名称',
                    },
                    {
                        key: '问题描述',
                        value: taskItem.eventdesc
                    },
                    {
                        key: '相关要求',
                    },
                    {
                        key: '地址',
                        value: taskItem.address
                    },
                    {
                        key: '上报时间',
                        value: taskItem.createtime
                    },
                    {
                        key: '下发时间',
                    }
                ]
//                this.loadMediaData()
            },
            loadMediaData(){
                http.ajax({
                    functionName: "getMediaInfo_ZX",
                    params: {
                        recID: this.taskItem.recid,
                        userID: gData.humanID,
                        actID: "-1",
                        startNum: "0",
                        endNum: "0"
                    },
                    success: data => {
                        let medias = eval(data.dataList)
                        medias.map(media => {
                            media.url = sysConfig.serverUrl
                                    + "/home/MIServlet/process.htm?product=68&reqType=downloadMedia&cardID=" + 4020
                                    + "&mediaNum=" + this.taskItem.tasknum
                                    + "_" + media.msgid + "_" + media.mediaid
                        })
                        this.mediaList = medias
                    },
                    start: ()=> {
                        Indicator.open()
                    },
                    finally: ()=> {
                        Indicator.close()
                    },
                    error(data) {
                        Toast("加载图片错误：" + data)
                    }
                })
            },
            vcClick() {
                if (this.isVerify) {
                    //go("taskVerfy", {taskInfo: $scope.detaildata});
                } else {
                    //go("taskCheck", {taskInfo: $scope.detaildata});
                }
            },
            chatClick () {
                //egovaNative.startCaseChat();
            }
        },
        components: {
            'grid-view': GridView
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                bindNavBar('详情')
                Util.resetObject(vm, defaultData())
                vm.init()
            })
        },
    }
</script>
