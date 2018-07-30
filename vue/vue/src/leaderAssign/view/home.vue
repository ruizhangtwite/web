<template>
    <div>
        <mt-header fixed title="领导交办">
            <div slot="right" id="add" @click="newTask" >
                <img src=/Users/haoweisun/Desktop/work/数字政通/智信web组重构-V2.0/eGovaZXCloud_V2.0/webapp/view/mobile/vue/image/g_item_bg_open.png class="image">
            </div>
        </mt-header>
        <div class="mint-content">
            <div v-for="item in datalist"
                 @click="goReply(item)" class="mint-content-item">
                <mt-cell-swipe v-bind:title="item.shn"
                         v-bind:label="item.ct"
                               class="no-line">
                </mt-cell-swipe>
                <div class="disp">{{disp(item)}}</div>
                <div class="task-content">
                    {{decodeURI(item.tc)}}
                </div>
                <mt-cell-swipe label="暂时没有该任务的回复"></mt-cell-swipe>
                <mt-cell-swipe>
                    <div slot="title" style="color: #f3715c;font-size: 13px">任务状态：{{calculateDateDiff(item.wrt)}}</div>
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

    var startNum = 0;
    var countPerPage = 20;

    function defaultData() {
        return {
            datalist: []

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
        methods: {
            init(){
                this.initDataSource();
            },
            initDataSource(){
                http.ajax({
                    functionName: "getDataList_ZX",
                    params: {
                        "iHumanID":G_data.humanID,
                        "sType":900,
                        "sExtend":"",
                        "startNum":0,
                        "endNum":20,
                        "productID":"68"
                    },
                    success: (data)=>{
                        if (data && data.errorCode == 0) {
                            this.dataList=[];
                            var list = JSON.parse(data.dataList);
                            for (var i = 0; i < list.length; i++) {
                                var item = list[i];
                                item.dispExpired = this.calculateDateDiff(item.wrt);
                                item.dispName = this.parseName(decodeURI(item.rns));

                                this.initReplyData(item.ti);

                                this.datalist.push(item);
                            }
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                })
            },

            initReplyData(taskID){
                http.ajax({
                    functionName: "getDataList_ZX",
                    that:this,
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
                            this.that.parseReplys(JSON.parse(data.dataList));
                        }
                    },
                    error: function (error) {

                    }
                });
            },

            disp(item){
                var dispMessage = "要求" + item.dispName + "于" + item.wrt + "之前回复";
                return dispMessage;
            },

            newTask() {
                this.$router.push({
                    name: "newTask",
                    params: {
                        tastInfo: 2,
                    }
                })
            },
            calculateDateDiff(date) {
                var cur_date = new Date();
                var pDate = new Date(Date.parse(date.replace(/-/g, "/")));

                var date3 = pDate.getTime() - cur_date.getTime(); //时间差的毫秒数
                var hasExpired = false;

                if (date3 < 0) {
                    date3 = Math.abs(date3);
                    hasExpired = true;
                }

                //计算出相差天数
                var days = Math.floor(date3 / (24 * 3600 * 1000))

                //计算出小时数
                var leave1 = date3 % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
                var hours = Math.floor(leave1 / (3600 * 1000))

                var dateString = "";
                if (days > 0)
                    dateString += days + "天";
                if (hours > 0)
                    dateString += hours + "小时";

                if (hasExpired) {
                    return "已超时" + dateString;
                }

                return "剩余" + dateString;

            },

            parseReplys(datalist) {
                var canreply = false;
                var canclosed = true;
                var showclosed = false;
                var iLatestIndex = -1;
                var needReplyNum = 0;

                var rolist = [];
                var latestROList = [];

                for (var i = 0; i < datalist.length; i++) {
                    var item = datalist[i];

                    if (item.ifw == 0) {
                        canclosed = false;
                        needReplyNum++;
                    }
                    if (item.fn == G_data.humanName && item.ifw == 0) {
                        canreply = true;
                    }

                    if (item.ifw > 0) {
                        rolist.push(item);
                    }
                }

                //最近回复修改为显示5条
                if (rolist.length > 0) {
                    if (rolist.length <= 5) {
                        for (var i = 0; i < rolist.length; i++) {
                            latestROList.add(rolist[i]);
                        }
                    } else {
                        for (var i = rolist.length - 5; i < rolist.length; i++) {
                            var bo = rolist[i];
                            latestROList.add(bo);
                        }
                    }
                }

                // showclosed = canclosed && (laBO.getCloseRankId() == 0) && (laBO.getCreaterid() == iHumanId);

                // laBO.setCanreply(canreply);
                // laBO.setCanclosed(canclosed);
                // laBO.setShowclosed(showclosed); // showclosed = canclosed && (laBO.getCloseRankId() == 0) && (laBO.getCreaterid() == iHumanId);

                // laBO.setCanreply(canreply);
                // laBO.setCanclosed(canclosed);
                // laBO.setShowclosed(showclosed);

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
            },

            goReply(taskInfo) {
                this.$router.push({
                    name: "reply",
                    that: this,
                    params: {
                        taskInfo: taskInfo,
                        callback: ()=> {
                            this.initDataSource()
                        }
                    }
                })
            },
        },
        beforeRouteEnter(to, from, next) {
            next(vm=> {
                vm.init()
            })
        }
    }
</script>