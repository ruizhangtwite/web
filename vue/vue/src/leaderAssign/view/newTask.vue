<template>
    <div>
        <mt-header fixed title="新建交办任务">
            <div slot="right" id="add" @click="createNewTask" >
                <img src=image/g_actionbar_ok.png alt="" class="image">
            </div>
        </mt-header>
        <div class="mint-content">
            <mt-cell v-bind:title="humanText">
                <img @click="selectHuman" slot="icon" src="image/g_media_add_album_normal.png" width="40" height="40">
            </mt-cell>
            <mt-field  placeholder="请输入交办内容" type="textarea" rows="6" v-model="taskObj.taskContent"></mt-field>
            <mt-cell class="bdr-t bdr-b" title="要求时间" is-link @click.native="openTaskDateSelectOptions">{{replyTimeDisplay}}</mt-cell>


            <mt-actionsheet
                    :actions="regionList"
                    cancelText="取消"
                    v-model="sheetVisible">
            </mt-actionsheet>
            <mt-popup
                    id="otherArea"
                    v-model="popupVisible"
                    position="bottom"
                    popup-transition="popup-fade">
                <mt-field id="otherDay" label="天" placeholder="请输入天" v-model="replyTimeDialogData.days"></mt-field>
                <mt-field id="otherHour" label="小时" placeholder="请输入小时"  v-model="replyTimeDialogData.hours"></mt-field>
                <mt-button type="default" @click="otherTimeSubmit" size="large">提交</mt-button>
            </mt-popup>
        </div>
    </div>
</template>
<style scoped>
    .add{
        height: 18px;
        width: 18px;
    }
    .add .image{
        width: 100%;
        height: 100%;
    }
    #otherArea{
        width: 100%;
    }

    #addHuman .image{
        width: 100%;
        height: 100%;
    }
    #addHuman{
        width: 40px;
        height: 40px;
    }

</style>
<script>
    import Util from 'Util';
    import http from 'Http';
    import DateUtil from 'DateUtil';
    import {MessageBox}  from 'mint-ui';
    import { Popup } from 'mint-ui';
    import egovaNative from 'egovanative';
    import sysConfig from 'sysConfig';
    import {Indicator, Toast} from 'mint-ui'


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
            humanText: '请选择接收人员',
            taskObj:{
                taskContent: "",
                replayTime: null
            },
            contactList:[],
            showRegion: false,
            isSelectStart: false,
            region: null,
            sheetVisible: false,
            MessageBox: MessageBox,
            popupVisible: false,
            diffHour:24,
            replyTimeDialogData : {
                days:1,
                hours:0
            },

        };
    }

    export default{
        data(){
            return defaultData();
        },
        components: {

        },
        computed: {
            replyTimeDisplay() {
                var date = new Date();
                date.setHours(date.getHours() + this.diffHour);
                this.taskObj.replyTime = DateUtil.formatDate(date.getTime(), DateUtil.FORMAT_YMDHMS);
                return DateUtil.formatDate(date.getTime(),DateUtil.FORMAT_YMDH_CN);
            },
            regionList() {
                var list = [{
                    name:'4小时',
                    hours:4
                }, {
                    name:'12小时',
                    hours:12
                }, {
                    name:'一天',
                    hours:24
                }, {
                    name:'一周',
                    hours:168
                }, {
                    name:'其他',
                }];
                return list.map(item=> {
                    return {
                        name: item.name,
                        method: ()=> {
                            this.onSelectRegion(item)
                        }
                    }
                })
            },


        },
        methods:{
            init(){
                Util.resetObject(this, defaultData())
                let params = this.$route.params;
                console.log(params);
            },
            getHumanNames(){
                var names = "";

                for (var i = 0; i < this.contactList.length; i++) {
                    names += encodeURIComponent(this.contactList[i]["name"] + "|");
                }
                return names;
            },
            getHumanIds(){
                var ids = "";

                for (var i = 0; i < this.contactList.length; i++) {
                    ids += encodeURIComponent(this.contactList[i]["uniqueID"] + "|");
                }
                return ids;
            },
            showAlert(msg, title){
                MessageBox(msg,title);
            },
            createNewTask(){
                Indicator.open();
                http.ajax({
                    //参数更改一下
                    //
                    functionName: "addLeaderAssignTask_ZX",
                    showAlert:this.showAlert,
                    params: {
                        sReceiverNames: this.getHumanNames(),
                        sReceiverIDs: this.getHumanIds(),
                        sTaskContent: encodeURIComponent(this.taskObj.taskContent),
                        iSenderID: this.humanID,
                        sWantReplyTime: this.taskObj.replyTime,
                        startNum: 0,
                        endNum: 0,
                        productID:"68"
                        //测试
//                        "sReceiverNames":encodeURIComponent("常月|"),
//                        "sReceiverIDs":"22|",
//                        "sTaskContent":encodeURIComponent("测试"),
//                        "iSenderID":"478",
//                        "sWantReplyTime":"2017-04-29 15:41:22",
//                        "startNum":0,
//                        "endNum":0,
//                        "productID":"68"
                    },
                    success:(data) =>{
                        if (data && data.errorCode == 0) {
                            this.contactList = [];
                            this.taskObj.taskContent = "";
                            this.humanText = "请选择接收人员";
                            this.showAlert("新建交办任务成功!", "提示");
                        } else {
                            this.showAlert("新建交办任务失败!", "提示");
                        }
                        Util.doCallback(this);
                        Indicator.close();
                    },
                    error: function(error) {
                        this.that.showAlert("新建交办任务失败!", "提示");
                        console.log(this.params);
                        Indicator.close();
                    }
                });
            },
            buildShowHumanText(){
                //change
                var text = "";
                if (this.contactList.length > 0) {
                    if (this.contactList[0]) {
                        text += this.contactList[0]["name"];
                    }

                    if ((this.contactList[1])) {
                        text += "、" + this.contactList[1]["name"];
                    }

                    if (this.contactList.length > 2) {
                        text += "等" + this.contactList.length + "人";
                    }
                } else {
                    text = "请选择接收人员";
                }

                return text;
            },
            selectHuman(){
                //change 原生方法。暂没改
                egovaNative.startContactChooseVC(function(res) {
                    console.log(res.rows);
                    for (var i = 0; i < res.length; i++) {
                        this.contactList.push(res[i]);
                    }

                    var timeout = $timeout(function() {
                        this.humanText = buildShowHumanText();
                    }, 0.5);
                }, function(error) {
                    console.log(error);
                });
            },
            openTaskDateSelectOptions(){
                this.taskDate = true;
                this.currentDate = this.taskDate;
                this.openRegion();
            },
            openRegion(){
                this.sheetVisible = true;
            },
            onSelectRegion(item){
                if(item.name === "其他"){
                    this.showOther();
                }else{
                    this.region = item.name;
                    this.showAlert(this.region,"任务时间");
                    this.diffHour = item.hours;
                }

            },
            showOther(){
                this.popupVisible = true;
            },
            otherTimeSubmit(){
                this.diffHour = parseInt(this.replyTimeDialogData.days*24)+parseInt(this.replyTimeDialogData.hours);
                this.popupVisible = false;
                this.showAlert(this.replyTimeDialogData.days+" 天 "+this.replyTimeDialogData.hours+"小时","任务时间");

            },


        },
        beforeRouteEnter(to, from, next) {
            next(vm=> {
                    vm.init()
            })
        }

    }
</script>