<template>
    <div>
        <div v-for="item in dataList" class="bdr-b list-item">
            <div class="row">
                <div v-show="item.showHumanName" class="gapRight">{{item.humanName}}</div>
                <div class="col-center checkTime">{{item.checkDate}}</div>
                <div class="explainTypeName rtag">{{item.explainTypeName}}</div>
            </div>
            <div class="checkLog" v-show="item.checkLog.isSiteException">
                <span>{{item.checkLog.type}}</span>
                <span class="textGray" v-show="item.checkLog.checkTime">{{item.checkLog.checkTime}}</span>
                <span class="textBlue" v-show="item.checkLog.address"
                      @click="goMap(item.checkLog)">{{item.checkLog.address}}</span>
                <span class="textGray"
                      v-show="item.checkLog.remark">({{item.checkLog.remark}})</span>
            </div>
            <div class="row" v-show="item.isShowSignTime">
                <div v-show="item.isShowSignInTime" class="signTime">
                    <span class="textGray">签到:</span>{{item.checkInTime}}
                </div>
                <div v-show="item.isShowSignOutTime" class="signTime">
                    <span class="textGray">签退:</span>{{item.checkOutTime}}
                </div>
            </div>
            <div class="row">
                <div class="textGray">说明:</div>
                <div class="col" style="padding:0px; white-space: normal;">{{item.applyOpinion}}</div>
            </div>

            <div class="row">
                <div class="col-center tag smallfont gapRight" :class="item.stateStyle">
                    {{item.applyStateText}}
                </div>
                <div class="col col-center smallfont replyInfo">({{item.replyInfo}})</div>
                <div class="verifyButton col-center" @click="deleteItem(item)"
                     v-show="item.showDeleteBtn">
                    删除
                </div>
                <div class="verifyButton col-center" @click="processExplain(item, true)"
                     v-show="item.showActionBtn">
                    通过
                </div>
                <div class="verifyButton col-center" @click="processExplain(item, false)"
                     v-show="item.showActionBtn">
                    不通过
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>

    .reason {
        padding: 0;
        margin-left: 10px;
        color: #FF3360
    }

    .applyState {
        padding: 3px;
        color: white;
    }

    .explainType {
        color: #FF3360
    }

    .signTime {
        margin-right: 15px;
    }

    .explainTypeName {
        background-color: #F36060;
        margin-left: 10px;
    }

    .gapRight {
        margin-right: 10px;
    }

    .list-item .checkLog {
        padding: 5px;
    }
</style>
<script>
    import {Indicator, MessageBox, Toast} from 'mint-ui'
    import {baseData, baseComputed, resolveResultData} from '../TabManager'
    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'

    export default{
        methods: {
            processExplain (item, isAgree) {
                MessageBox.confirm(`确定${isAgree ? '通过' : '不通过'}？`).then(action => {
                    this.processExplainImpl(item, isAgree)
                }, cancel=> {
                })

            },
            processExplainImpl(item, isAgree) {
                http.ajax({
                    functionName: "mi/explain/saveexplainreply",
                    params: {
                        replyOpinion: "",
                        agreeFlag: isAgree ? 1 : 0,
                        applyID: item.explainID,
                        humanID: gData.humanID
                    },
                    success: (data) => {
                        if (data.success) {
                            Util.refreshPluginCount()
                            Util.removeItemFromList(this.dataList, (itemParam) => {
                                return itemParam == item
                            })
                            Toast("操作成功")
                            //如果是考勤地点异常，并且有clusterID，则说明是在未认证地点打卡5此以上
                            if ((item.explainType == sysConfig.EXPLAIN_TYPE_SITE_EXCEPTION_IN
                                    || item.explainType == sysConfig.EXPLAIN_TYPE_SITE_EXCEPTION_OUT)
                                    && item.clusterID && item.identifyFlag == 0) {
                                this.showIdentifyDialog(item)
                            }
                        } else {
                            Toast("操作失败:" + data.message)
                        }
                    },
                    error: function (data) {
                        Toast("操作错误：" + data)
                    },
                })
            },
            showIdentifyDialog(item) {
                MessageBox.confirm('该地址尚未认证，请点击确定进行认证').then(action => {
                    this.$router.push({
                        name: 'kqMapIdentify',
                        params: {
                            humanID: item.humanID,
                            clusterID: item.clusterID
                        }
                    })
                }, cancel=> {
                });
            },
            deleteItem (item) {
                MessageBox.confirm('确定删除？').then(action => {
                    this.deleteImpl(item)
                }, cancel=> {
                })
            },

            deleteImpl (item) {
                Indicator.open()
                http.ajax({
                    functionName: "mi/explain/deleteexplain",
                    params: {
                        humanID: gData.humanID,
                        explainId: item.explainID
                    },
                    success: (data) => {
                        if (data.success) {
                            Toast("删除成功")
                            Util.refreshPluginCount()
                            Util.removeItemFromList(this.dataList, (itemParam) => {
                                return itemParam == item
                            })
                            this.$emit('onItemDelete', item)
                            this.totalCount = this.dataList.length
                        } else {
                            Toast("删除失败:" + data.message)
                        }
                    },
                    error: function (data) {
                        Toast("删除错误：" + data)
                    },
                    finally: function () {
                        Indicator.close()
                    }
                })
            },
            goMap(item) {
                this.$router.push({
                    name: 'kqMap',
                    params: {
                        lng: item.lng,
                        lat: item.lat,
                        address: item.address,
                        humanID: item.humanId
                    }
                })
            }
        },
        props: {
            dataList: Array
        }
    }
</script>
