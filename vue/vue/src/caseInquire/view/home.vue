<template>
    <div class="mint-content" >
        <mt-header fixed title="案例查询" fixed></mt-header>
        <a class="mint-cell mint-field query-item">
            <div class="mint-cell-left"></div>
            <div class="mint-cell-wrapper">
                <div class="mint-cell-title">起始日期:</div>
                <div class="mint-cell-value">
                    <button class="mint-field-core" @click.native="selectStartDate">{{startDate}}</button>
                </div>
            </div>
            <div class="mint-cell-right"></div>
        </a>

        <a class="mint-cell mint-field query-item">
            <div class="mint-cell-left"></div>
            <div class="mint-cell-wrapper">
                <div class="mint-cell-title">结束日期</div>
                <div class="mint-cell-value">
                    <button class="mint-field-core" @click.native="selectEndDate">{{endDate}}</button>
                </div>
            </div>
            <div class="mint-cell-right"></div>
        </a>

        <mt-field label="任务号:" type="text" class="query-item-text" v-model:value="taskNum"></mt-field>

        <a class="mint-cell mint-field query-item">
            <div class="mint-cell-left"></div>
            <div class="mint-cell-wrapper">
                <div class="mint-cell-title">类型:</div>
                <div class="mint-cell-value">
                    <button class="mint-field-core" @click.native="typeSelect">{{eventTypeID}}</button>
                </div>
            </div>
            <div class="mint-cell-right"></div>
        </a>

        <a class="mint-cell mint-field query-item">
            <div class="mint-cell-left"></div>
            <div class="mint-cell-wrapper">
                <div class="mint-cell-title">大类:</div>
                <div class="mint-cell-value">
                    <button class="mint-field-core" @click.native="mainTypeIDSelect">{{mainTypeID}}</button>
                </div>
            </div>
            <div class="mint-cell-right"></div>
        </a>

        <a class="mint-cell mint-field query-item">
            <div class="mint-cell-left"></div>
            <div class="mint-cell-wrapper">
                <div class="mint-cell-title">小类:</div>
                <div class="mint-cell-value">
                    <button class="mint-field-core" @click.native="subTypeIDSelect">{{subTypeID}}</button>
                </div>
            </div>
            <div class="mint-cell-right"></div>
        </a>

        <a class="mint-cell mint-field query-item">
            <div class="mint-cell-left"></div>
            <div class="mint-cell-wrapper">
                <div class="mint-cell-title">位置:</div>
                <div class="mint-cell-value">
                    <button class="mint-field-core" @click.native="postionSelect">地图定位</button>
                </div>
            </div>
            <div class="mint-cell-right"></div>
        </a>

        <mt-cell title="案件状态:"></mt-cell>
            <div class="switchs cleafix">
                <div>
                    <mt-switch v-model="caseState.dealing"> 处理中</mt-switch>
                </div>
                <div>
                    <mt-switch v-model="caseState.dealed"> 结案</mt-switch>
                </div>
                <div>
                    <mt-switch v-model="caseState.chargeAccount"> 挂帐</mt-switch>
                </div>
                <div>
                    <mt-switch v-model="caseState.canceled"> 作废</mt-switch>
                </div>
            </div>

            <mt-field label="描述:" type="text" class="query-item-text" v-model="descript"></mt-field>
            <mt-field label="查询范围:" type="text"  class="query-item-text"></mt-field>
            <mt-field label="处置部门:" type="button" class="query-item" disableClear></mt-field>
            <mt-button size="large" style="position: fixed; bottom: 0" type="primary" @click.native="inquire">查询</mt-button>
        <mt-datetime-picker
                ref="datePicker"
                @confirm="onDateSelect"
                v-model="currentDate"
                type="date">
        </mt-datetime-picker>
        <mt-popup
                v-model="popupVisible"
                position="bottom"
                style="width: 100%">
            <mt-picker :slots="pickerItems" @change="onValuesChange"></mt-picker>
        </mt-popup>
    </div>


</template>
<style >
    .mint-cell-title{
        width: 105px;
    }
    .query-item .mint-field-core{
        border-radius: 3px;
        background: #ffffff;
        border: 1px solid #8F8F8F;
        text-align: center;
        color: #8F8F8F;
    }
    .query-item-text .mint-field-core{
        border-radius: 3px;
        background: #ffffff;
        border: 1px solid #8F8F8F;
        color: inherit;
    }

    .switchs{
        position: relative;
        background: #ffffff;
        display: block;
        padding: 2%;
    }
    .cleafix:after{
        content: "";
        display: block;
        clear: both;
        visibility: hidden;
    }
    .switchs>div{
        float: left;
        width: 48%;
    }

</style>

<script>
    import { Navbar, TabItem, Indicator, MessageBox, Toast, InfiniteScroll, Button, DatetimePicker} from 'mint-ui';
    import Util from 'Util'
    import dateUtil from 'DateUtil'
    import { data as gData } from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import { bindNavBar } from 'egovanative'
    import { baseData, baseComputed, resolveHasMore, resolveResultData } from 'ListManager';

    //import detailHeader from '../widget/detailHeader.vue';
    //import commentCell  from '../widget/commentCell.vue';
    function defaultData(){
        return  {
            isSelectStart: false,
            currentDate: new Date(),
            startDate: "",
            endDate: "",
            caseState:{dealing:false,dealed:false,chargeAccount:false,canceled:false},
            pickerVisible:true,
            taskNum:null,
            popupVisible: false,
            eventTypeID:"全部",
            mainTypeID:"全部",
            subTypeID:"全部",
            pickerItems:[],
            selectFlag:null,
            descript:null
        }
    }
    export default{
        data(){
            return defaultData();
        },
        computed:{

        },
        methods:{
            test(){alert(1)},

            init(){
                this.startDate = dateUtil.formatDate(this.currentDate.getTime(),dateUtil.FORMAT_YMD);
                this.endDate = dateUtil.formatDate(this.currentDate.getTime(),dateUtil.FORMAT_YMD);
            },

            selectStartDate() {
                this.isSelectStart = true;
                this.currentDate = this.startDate;
                this.openPicker();
            },
            selectEndDate() {
                this.isSelectStart = false;
                this.currentDate = this.endDate
                this.openPicker()
            },
            openPicker() {
                this.$refs.datePicker.open()
            },
            onDateSelect(value) {
                if (this.isSelectStart) {
                    this.startDate = dateUtil.formatDate(value.getTime(),dateUtil.FORMAT_YMD);
                } else {
                    this.endDate = dateUtil.formatDate(value.getTime(),dateUtil.FORMAT_YMD);
                }
            },
            typeSelect() {
                this.selectFlag=0;
                this.pickerItems = [{
                    flex:1,
                    values:[
                        "全部",
                        "部件",
                        "事件",
                    ],
                    textAlign:"center"
                }];
                this.popupVisible=true;
            },
            mainTypeIDSelect(){
                this.selectFlag=1;
                this.pickerItems = [{
                    flex:1,
                    values:["全部",
                    "扩展事件",
                    "街面秩序",
                    "扩展部件",
                    "施工管理",
                    "突发事件",
                    "市容环境",
                    "宣传广告",
                    "网络通讯",
                    "施工管理",
                    "施工管理",
                    "施工管理",
                    "施工管理",],
                    textAlign:"center"
                }]
                this.popupVisible=true;
            },
            subTypeIDSelect(){
                this.selectFlag=2;
                this.pickerItems = [{
                    flex:1,
                    values:["全部",
                        "扩展事件",
                        "街面秩序",
                        "扩展部件",
                        "施工管理",
                        "突发事件",
                        "市容环境",
                        "宣传广告",
                        "网络通讯",
                        "施工管理",
                        "施工管理",
                        "施工管理",
                        "施工管理",],
                    textAlign:"center"
                }];
                this.popupVisible=true;
            },
            onValuesChange(picker,values){
                var value = picker.getValues();
                if(this.selectFlag===0){
                    this.eventTypeID = value[0];
                }
                if(this.selectFlag===1){
                    this.mainTypeID = value[0];
                }
                if(this.selectFlag===2){
                    this.subTypeID = value[0];
                }
                console.log(value);
            },
            inquire(){
                this.$router.push({
                    name:"result",
                    params:{
                        cardID: "",
                        humanID: "478",
                        taskListID: "2",
                        pageRecCount: "10",
                        pageNo: "1",
                        taskNum:"",
                        eventTypeName:"",
                        mainTypeName:"",
                        subTypeName:"",
                        startDate:"",
                        assign:"-1",
                        endDate:"",
                        actTimeStateID:"-1",
                        actArdStateID:"-1",
                        sort:"",
                        coordX:"-1.0",
                        coordY:"-1.0",
                        radarLimit:"-1.0",
                        radarNumLimit:"-1",
                        keyword:"",
                    }
                })
            },
            postionSelect(){
                alert("选择地点")
            }

        },
        beforeRouteEnter(to, from, next){
            next(vm => {
                vm.init();
            })
        }

    }
</script>

