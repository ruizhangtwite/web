<template>
    <div class="mint-content" style='top: 0px'>
        <div
                v-infinite-scroll="loadData"
                infinite-scroll-disabled="disableLoad"
                infinite-scroll-distance="10"
                infinite-scroll-immediate-check="false">
            <div @click="gotoCaseDetail(index)" class="itemContainer bdr-b middleFont" v-for="(obj, index) in dataList">
                <div class="col">
                    <div class="title">
                        {{obj.subtypename}}
                    </div>
                    <div class="row">
                        <div class="person">
                            {{obj.actdefname}}
                        </div>
                        <div class="point">
                            0.5分
                        </div>
                        <div class="deadline">
                            {{obj.actdeadline}}
                        </div>
                    </div>
                    <grid-view class="mediaContent" style="margin-left: 12px" :childWidth="75" :minGap="10">
                        <div v-for="(item, index) in obj.imgSrcList">
                            <img :src="item"/>
                        </div>
                    </grid-view>
                    <div class="address">
                        {{obj.address}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .child img{
        width: 100%;
        height: 80px;
    }
    .title{
        color: #37AEFF;
        font-size: 18px;
        margin-top: 16px;
        margin-left: 12px;
    }
    .col{
        margin-top: 12px;
    }
    .person{
        color: #BFBFBF;
        font-size: 12px;
        margin-left: 12px;
    }
    .point{
        color: #BFBFBF;
        font-size: 12px;
        margin-left: 12px;
    }
    .deadline{
        color: #BFBFBF;
        font-size: 12px;
        margin-left: auto;
        margin-right: 12px;
    }
    .desc{
        color: #323334;
        font-size: 15px;
        margin-left: 12px;
        margin-right: 12px;
        margin-top: 8px;
    }
    .containar_medias {
        margin-top: 8px;
        margin-left: 5px;
        margin-right: 5px;
    }
    .media_css {
        float: left;
        margin-left: 5px;
    }
    .address{
        margin-left: 12px;
    }

</style>
<script>
    import {Navbar, TabItem, Indicator, MessageBox, Toast} from 'mint-ui';
    import Util from 'Util'
    import dateUtil from 'DateUtil'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import {bindNavBar} from 'egovanative'
    import {baseData, baseComputed, resolveHasMore, resolveResultData} from 'ListManager';
    import GridView from '../../libs/widget/GridView.vue';

    function defaultData() {
        return {
            ...baseData(),
            dataList: [],
            humanID: gData.humanID,
        }
    }

    export default{
        data(){
            return defaultData()
        },
        computed: {
            ...baseComputed,
            mediaGap() {
                let width = window.innerWidth - 32
                let num = Math.floor(width / 85)
                return {num, gap: Math.floor((width - num * 85) / (num - 1))}
            }
        },
        components: {
            'grid-view': GridView
        },
        methods: {
            init() {
                this.loadData(true);
            },
            gotoCaseDetail(i){
                let dataObj = this.dataList[i];
                this.$router.push({
                    name: 'detail',
                    params: {
                        object: dataObj
                    }
                })
            },
            loadData(isRefresh){
                Indicator.open();

                if (isRefresh) {
                    this.dataList = []
                }

                if (true) {
                    http.ajaxV2({
                        functionName: "getTransferedTask_ZX",
                        params: {
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
                        },
                        success: (data) => {
                            if (data && data.errorCode == 0) {
                                var temp = [];
                                temp = JSON.parse(data.dataList);
                                for (var i = 0; i < temp.length; i++) {
                                    var item = temp[i];
                                    var taskItem = {
                                        cellid: item.cellid,
                                        taskType: item.tasktype,
                                        communityname: item.communityname,
                                        rn: item.rn,
                                        districtname: item.districtname,
                                        eventtypename: item.eventtypename,
                                        coordy: item.coordy,
                                        eventtypeid: item.eventtypeid,
                                        coordx: item.coordx,
                                        subtypename: item.subtypename,
                                        streetid: item.streetid,
                                        id: item.id,
                                        maintypename: item.maintypename,
                                        dutygridname: item.dutygridname,
                                        tasknum: item.tasknum,
                                        communityid: item.communityid,
                                        subtypeid:item.subtypeid,
                                        picidlist:item.picidlist,
                                        cellname: item.cellname,
                                        actdefname: item.actdefname,
                                        verifymsgstateid: item.verifymsgstateid,
                                        actid: item.actid,
                                        streetname: item.streetname,
                                        actcreatetime: item.actcreatetime,
                                        checkmsgstateid: item.checkmsgstateid,
                                        eventdesc: item.eventdesc,
                                        eventsrcname: item.eventsrcname,
                                        fanfu: item.fanfu,
                                        address: item.address,
                                        recid: item.recid,
                                        districtid: item.districtid,
                                        reccreatetime: item.reccreatetime,
                                        dutygridid: item.dutygridid,
                                        maintypeid: item.maintypeid,
                                        actdeadline: item.actdeadline,
                                        imgSrcList: [],
                                    };


                                    var idList = item.picidlist.split(",");
                                    for (var j=0; j<idList.length; j++){
                                        var imgSrc = Util.getV11ServerUrl()+"/home/MIServlet/process.htm?reqType=downloadMedia&cardID=&mediaNum="+item.tasknum+"_"+idList[j];
                                        taskItem.imgSrcList.push(imgSrc)
                                    }

                                    this.dataList.push(taskItem);
                                }
                            } else {
                                alert(data.errorDesc);
                            }
                        },
                        finally: () => {
                            Indicator.close()
                        }
                    })
                }
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.init()
                bindNavBar('案卷处置')
            })
        }
    }
</script>