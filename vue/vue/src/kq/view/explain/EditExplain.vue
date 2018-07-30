<template>
    <div>
        <mt-header fixed v-on:backClick="goBack" title="填写情况说明">
            <mt-button slot="right" @click.native="goReasonInfo">关于</mt-button>
        </mt-header>
        <div class="mint-content">
            <div class="gap">
                <mt-cell title="考勤日期">
                    <span class="mint-cell-arrow-text">
                        {{checkDate}}
                    </span>
                </mt-cell>
                <mt-cell title="类型">
                    <span class="mint-cell-arrow-text">
                        {{explainTypeName}}
                    </span>
                </mt-cell>
                <mt-cell title="描述" class="desc" v-show="explainDesc">
                    <span class="mint-cell-arrow-text">
                        {{explainDesc}}
                    </span>
                </mt-cell>
            </div>

            <div class="gap bdr-t bdr-b middleFont checkLog" v-show="isSiteException">
                <span>{{checkLog.type}}</span>
                <span class="textGray" v-show="checkLog.checkTime">{{checkLog.checkTime}}</span>
                <span class="textBlue" v-show="checkLog.address"
                      @click="goMap(checkLog)">{{checkLog.address}}</span>
                <span class="textGray"
                      v-show="checkLog.remark">({{checkLog.remark}})</span>
            </div>

            <div class="gap">
                <mt-cell title="上班时间" v-show="isShowSignInTime" @click.native="selectCheckTime(true)">
                    <span class="mint-cell-allow-right mint-cell-arrow-text">
                        {{checkInTime}}
                    </span>
                </mt-cell>
                <mt-cell title="下班时间" v-show="isShowSignOutTime" @click.native="selectCheckTime(false)">
                    <span class="mint-cell-allow-right mint-cell-arrow-text">
                        {{checkOutTime}}
                    </span>
                </mt-cell>
            </div>

            <div class="gap" v-show="!hideAddress">
                <mt-cell title="考勤城市" @click.native="selectCity">
                     <span class="mint-cell-allow-right mint-cell-arrow-text">
                        {{address}}
                    </span>
                </mt-cell>
            </div>

            <div class="bdr-b bdr-t gap" style="background:white">
                <textarea class="default" id="applyOpinion" placeholder="忘记打卡，加班超过24点无法打卡等" rows="6"
                          v-model="applyOpinion"></textarea>
            </div>

            <div class="gap">
                <mt-cell title="提交到">
                    <span class="mint-cell-arrow-text">
                        {{seniorHuman.humanName}}
                    </span>
                </mt-cell>
            </div>

            <div style="height:50px"></div>

        </div>
        <mt-datetime-picker
                ref="timePicker"
                @confirm="onTimeSelect"
                v-model="currentTime"
                type="time">
        </mt-datetime-picker>

        <div class="bottomSection bdr-t flex center-child center-content" @click="saveExplainApply">
            <i class="bottomBtnImg"></i>
            提交
        </div>
    </div>
</template>
<style>
    /* 布局为div-container{div-left, div-right}，
     * div-container为flex布局且div-left的flex为1，
     * left会撑满除去right所剩下的布局。但是如果right
     * 特别长，在有些系统中right会占据整个宽度，使得
     * left的宽度为0，这里强行给left一个最小宽度以避
     * 免上述问题。
     */
    .desc .mint-cell-title {
        min-width: 40px;
    }

    /*
     * 在有些手机上弹出的时间选择框没有显示时间
     */
    .picker.mint-datetime-picker .picker-items {
        width: 100%;
    }
</style>
<style scoped>
    .mint-cell {
        min-height: 40px;
    }

    #applyOpinion {
        font-size: 16px;
        margin-top: 0;
    }

    .bdr-b::after, .bdr-t::before {
        border-bottom-color: #d9d9d9;
    }

    .bottomBtnImg {
        background-image: url('../../image/icon_btn_save.png');
    }

    .checkLog {
        padding: 10px;
        background-color: white;
    }


</style>
<script>
    import {Indicator} from 'mint-ui'
    import {Toast} from 'mint-ui'

    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import dateUtil from 'DateUtil'
    import {bindNavBar, isDefMethod, selectTime} from 'egovanative'

    import {isShowSignInTime as showSingIn, isShowSignOutTime as showSingOut} from '../TabManager'

    function defaultData() {
        return {
            statRecordId: null,
            explainType: '',
            explainTypeName: '',
            explainDesc: '',//描述

            reasonTypeID: 1, //默认选择其他原因

            applyOpinion: '',
            checkDate: '',

            checkInTime: null,
            checkOutTime: null,

            currentTime: null,
            isSelectCheckInTime: false,
            isShowSignInTime: true,
            isShowSignOutTime: true,
            callback: null,
            seniorHuman: {
                hasInit: false
            },
            selectedCity: null,
            selectedProvince: null,
            checkLog: {}
        }
    }

    function formatTime(dateObj) {
        return dateUtil.formatDateByDate(dateObj, dateUtil.FORMAT_HM) + ":00"
    }

    function getTime(hour, minutes) {
        var d = new Date()
        d.setMinutes(minutes)
        d.setHours(hour)
        return formatTime(d)
    }

    export default {
        data() {
            return defaultData()
        },
        methods: {
            goBack() {
                Util.goBack()
            },
            goReasonInfo() {
                this.$router.push({
                    name: 'aboutReason'
                })
            },
            selectCheckTime(isCheckIn) {
                if (isDefMethod('selectTime')) {
                    window.selectTimeCallback = (hour, minute) => {
                        window.selectTimeCallback = null
                        let timeFormat = getTime(hour, minute)
                        if (isCheckIn) {
                            this.checkInTime = timeFormat
                        } else {
                            this.checkOutTime = timeFormat
                        }
                    }
                    let time = isCheckIn ? this.checkInTime : this.checkOutTime
                    let re = time.match(/(\d{2}):(\d{2})(?::\d{2})?/)
                    let hour = 0, minute = 0
                    if (re && re.length == 3) {
                        hour = parseInt(re[1])
                        minute = parseInt(re[2])
                    }
                    selectTime('selectTimeCallback', hour, minute)
                } else {
                    if (isCheckIn) {
                        this.selectCheckInTime()
                    } else {
                        this.selectCheckOutTime()
                    }
                }

            },
            onTimeSelect(value) {
                value += ":00"
                if (this.isSelectCheckInTime) {
                    this.checkInTime = value
                } else {
                    this.checkOutTime = value
                }
            },
            selectCheckInTime() {
                this.isSelectCheckInTime = true
                this.currentTime = this.checkInTime
                this.openPicker()
            },
            selectCheckOutTime() {
                this.isSelectCheckInTime = false
                this.currentTime = this.checkOutTime
                this.openPicker()
            },
            openPicker() {
                this.$refs.timePicker.open()
            },
            selectCity() {
                this.$router.push({
                    name: 'selectCity',
                    params: {
                        selectedCity: this.selectedCity,
                        selectedProvince: this.selectedProvince,
                        callback: (province, city)=> {
                            this.selectedCity = city
                            this.selectedProvince = province
                        }
                    }
                })
            },
            getSeniorName () {
                http.ajax({
                    functionName: "mi/explain/initreasonandmanager",
                    params: {
                        humanID: gData.humanID,
                    },
                    success: (data) => {
                        if (data.success && data.data) {
                            this.seniorHuman.hasInit = true
                            this.seniorHuman = data.data.seniorHuman || {}
                        }
                    },
                    error: function (data) {
                    },
                })
            },
            saveExplainApply() {
                if (!this.checkInputValid()) {
                    return
                }
                Indicator.open()
                http.ajax({
                    functionName: "mi/explain/saveexplainapply",
                    params: this.getParams({
                        explainType: this.explainType,
                        reasonTypeID: this.reasonTypeID,
                        applyOpinion: this.applyOpinion,
                        address: this.address,
                        cityID: this.selectedCity && this.selectedCity.id,
                        baiduCode: this.selectedCity && this.selectedCity.baiduCode,
                        checkDate: this.checkDate,
                        humanID: gData.humanID,
                        replyHumanID: this.seniorHuman.humanID
                    }),
                    success: (data) => {
                        if (data.success) {
                            Toast("添加记录成功")
                            Util.refreshPluginCount()
                            this.goBack()
                            if (this.callback) {
                                this.callback(this.statRecordId)
                            }
                        } else {
                            Toast("添加记录失败:" + data.message)
                        }
                    },
                    error: function (data) {
                        alert("添加记录错误")
                    },
                    finally: () => {
                        Indicator.close()
                    }
                })
            },
            checkInputValid() {
                if (!this.checkDate) {
                    Toast("考勤时间不能为空")
                    return false
                }

                if (!this.applyOpinion) {
                    Toast("情况说明理由不能为空")
                    return false
                }

                if (!this.hideAddress) {
                    if (!this.address) {
                        Toast("地址不能为空")
                        return false
                    }
                }

                if (!this.seniorHuman.humanID) {
                    if (this.seniorHuman.hasInit) {
                        Toast("您没有上级领导，请先设置")
                    } else {
                        Toast("未获取到审核人信息")
                    }
                    return false
                }
                return true
            },
            getParams(params) {
                if (this.isShowSignInTime) {
                    params.checkInTime = this.checkInTime
                }
                if (this.isShowSignOutTime) {
                    params.checkOutTime = this.checkOutTime
                }
                return params
            },

            initOnCreate() {
                var params = this.$route.params
                if (!params) return
                this.explainType = params.explainType
                this.explainTypeName = params.explainTypeName
                this.checkDate = params.checkDate
                this.statRecordId = params.statRecordId
                if (params.explainDesc) {
                    if (params.explainDesc[0] == '{') {
                        try {
                            let jsonObj = JSON.parse(params.explainDesc)
                            this.explainDesc = jsonObj && jsonObj.exceptionInfo
                        } catch (e) {
                            Util.log(e)
                        }
                    } else {
                        this.explainDesc = params.explainDesc
                    }
                }

                if (this.isSiteException) {
                    this.checkLog = {...(params.checklog || {})}
                    this.checkLog.checkTime = this.checkLog.checkTime && dateUtil.formatDateByDate(
                                    dateUtil.parseDate(this.checkLog.checkTime), dateUtil.FORMAT_HM)
                    if (params.explainType == sysConfig.EXPLAIN_TYPE_SITE_EXCEPTION_IN) {
                        this.checkLog.type = '签到'
                    } else if (params.explainType == sysConfig.EXPLAIN_TYPE_SITE_EXCEPTION_OUT) {
                        this.checkLog.type = '签退'
                    }
                }


                this.checkInTime = getTime(8, 50)
                this.checkOutTime = getTime(18, 10)

                this.isShowSignInTime = showSingIn(this.explainType)
                this.isShowSignOutTime = showSingOut(this.explainType)

                this.currentTime = this.checkInTime

                this.callback = params.callback
                this.getSeniorName()
            },
            bindNavBarImpl() {
                bindNavBar('填写情况说明', '帮助', () => {
                    this.goReasonInfo()
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
        computed: {
            hideAddress () {
                switch (this.explainType) {
                    case sysConfig.EXPLAIN_TYPE_SITE_EXCEPTION_IN:
                    case sysConfig.EXPLAIN_TYPE_SITE_EXCEPTION_OUT:
                    case sysConfig.EXPLAIN_TYPE_CHECK_EXCEPTION_IN:
                    case sysConfig.EXPLAIN_TYPE_CHECK_EXCEPTION_OUT:
                    case sysConfig.TYPE_APPLY_SITE_EXCEPTION_IN:
                    case sysConfig.TYPE_APPLY_SITE_EXCEPTION_OUT:
                        return true
                    default:
                        return false
                }
            },
            isSiteException() {
                return this.explainType == sysConfig.EXPLAIN_TYPE_SITE_EXCEPTION_IN ||
                        this.explainType == sysConfig.EXPLAIN_TYPE_SITE_EXCEPTION_OUT
            },
            address() {
                var address = ''
                if (this.selectedCity) {
                    //过滤掉直辖市
                    if (this.selectedProvince && this.selectedProvince.id != this.selectedCity.id) {
                        address = `${this.selectedProvince.provinceName} `
                    }
                    address += this.selectedCity.cityName
                }
                return address
            }
        },

        beforeRouteEnter (to, from, next) {
            next(vm => {
                if (vm.isNewPage(to)) {
                    Util.resetObject(vm, defaultData())
                    vm.initOnCreate()
                }
                vm.bindNavBarImpl()
            })
        }
    }
</script>
