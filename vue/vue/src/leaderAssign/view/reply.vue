<template>
    <div>
        <mt-header fixed title="回复信息">
        </mt-header>
        <div class="mint-content">
            <div>
                <mt-cell-swipe v-bind:title="shn"
                               v-bind:label="ct"
                               class="no-line">
                </mt-cell-swipe>
                <div class="disp">{{disp(taskInfo)}}</div>
                <div class="task-content">
                    {{decodeURI(tc)}}
                </div>
                <mt-cell-swipe label="暂时没有该任务的回复"></mt-cell-swipe>
                <mt-cell-swipe>
                    <div slot="title" style="color: red;font-size: 12px">任务状态：{{dispExpired}}</div>
                </mt-cell-swipe>
            </div>
            <div class="reply-list" v-for="item in replys">
                <mt-cell-swipe>
                    <div slot="title">
                        <div>{{item.fn}}</div>
                        <div>
                            <span>回复 {{item.rn}}</span>:<span>{{item.rc}}</span>
                        </div>
                    </div>
                </mt-cell-swipe>
            </div>
        </div>
    </div>
</template>
<style>
    .mint-content-item{
        border-bottom: 2px solid rgb(218,218,218);
    }
    .disp{
        color: #888;
        display: block;
        font-size: 12px;
        background-color: #fff;
        box-sizing: border-box;
        display: block;
        overflow: hidden;
        position: relative;
        text-decoration: none;
        padding: 0 10px;
    }
    .task-content{

        color: #686868;
        display: block;
        font-size: 14px;
        background-color: #fff;
        box-sizing: border-box;
        display: block;
        overflow: hidden;
        position: relative;
        text-decoration: none;
        padding: 5px 10px 0 10px;
    }
    .no-line>.mint-cell-wrapper{
        background: none;
    }
</style>
<script>
    import Util from 'Util';
    import http from 'Http';
    import {Message} from 'mint-ui';
    import sysConfig from 'sysConfig';

    var G_data={
        humanID: "",
        humanName: "",
        cardID: ""
    };
    function initData(data) {
        data.humanID = Util.getRequestParam("humanID");
        data.humanName = Util.getRequestParam("humanName");
        data.cardID = Util.getRequestParam("cardID");
    }
    initData(G_data);


    function defaultData() {
        return {
                taskInfo:"",
                shn: "",
                wrt: "",
                rn: "",
                lri: "",
                shi: "",
                cri: "",
                ct: "",
                ti: "",
                tc: "",
                dispName: "",
                dispExpired:"",
                replys:"",

        }
    }
    export default{
        data(){
            return defaultData();
        },
        components: {
        },
        computed: {
        },
        methods:{
            init(){
                Util.resetObject(this, defaultData());
                let params = this.$route.params;
                this.taskInfo = params.taskInfo;
                console.log(this.taskInfo);
                this.shn = this.taskInfo.shn;
                this.wrt = this.taskInfo.wrt;
                this.dispName = this.taskInfo.dispName;
                this.rn = this.taskInfo.rn;
                this.lri = this.taskInfo.lri;
                this.shi = this.taskInfo.shi;
                this.cri = this.taskInfo.cri;
                this.ct = this.taskInfo.ct;
                this.ti = this.taskInfo.ti;
                this.tc = this.taskInfo.tc;
                this.dispExpired = this.taskInfo.dispExpired;
                this.replys = [];
                this.initReplyData(this.ti);
            },
            disp(item){
                var dispMessage = "要求"+this.dispName+"于"+this.wrt+"之前回复";
                return dispMessage;
            },
            showAlert(msg, title){
                MessageBox(msg,title);
            },
            //初始化数据的方法
            initReplyData(taskID){
                http.ajaxV2({
                    "functionName": "getDataList_ZX",
                    params: {
                        "iHumanID":G_data.humanID,
                        "sType":901,
                        "sExtend":taskID,
                        "startNum":0,
                        "endNum":5,
                        "productID":"68"
                    },
                    success: function (data) {
                        if (data && data.errorCode == 0) {
                            this.parseReplys(JSON.parse(data.dataList));
                        }
                    },
                    error: function (error) {

                    }
                });
            },

            parseReplys(datalist) {
                var canreply = false;
                var canclosed = true;
                var showclosed = false;
                var iLatestIndex = -1;
                var needReplyNum = 0;

                for (var i = 0; i < datalist.length; i++) {
                    var item = datalist[i];

                    if (item.ifw == 0) {
                        canclosed = false;
                        needReplyNum++;
                    }
                    if (item.fn == sysConfig.humanName && item.ifw == 0) {
                        canreply = true;
                    }

                    if (item.ifw > 0) {
                        this.replys.push(item);
                    }
                }

                showclosed = canclosed && (this.cri == 0) && (this.shi == sysConfig.humanID);
                this.taskInfo.canreply = canreply;
                this.taskInfo.canclosed = canclosed;
                this.taskInfo.showclosed = showclosed;

                getAssignState(this.taskInfo);
                this.taskInfo.needReplyNum = needReplyNum;
            },

            getAssignState(bo) {
                if (bo.canreply) {
                    bo.assignState = 1;
                } else if (bo.cri > 0) {
                    bo.assignState = 4;
                } else if (bo.canclosed && bo.cri == 0) {
                    bo.assignState = 3;
                } else if (!bo.canreply) {
                    bo.assignState = 2;
                }
            },

            parseName(names) {
                var nameArray = names.split("|");
                var nameText = "";
                if (nameArray.length > 0 && nameArray[0] != null && nameArray[0].length > 0) {
                    nameText = nameArray[0];
                    if (nameArray.length > 1 && nameArray[1] != null && nameArray[1].length > 0)
                        nameText += "等人";
                }

                return nameText;
            }

        },
        beforeRouteEnter(to, from, next) {
            next(vm=> {
                    vm.init()
            })
        }
    }
</script>