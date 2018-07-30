<template>
    <div>
        <mt-header fixed v-on:backClick="goBack" title="新增考勤申请">
            <mt-button slot="right" @click.native="goHelp">帮助</mt-button>
        </mt-header>
        <div class="mint-content soft-scrollable middleFont">
            <div class="row contentItem bdr-t bdr-b flex typeContainer">
                <div class="type"
                     :class="{typeSelected : selectedType.id == item.id}"
                     v-for="(item, index) in typeList"
                     @click="selectedType = item">
                    <div class="typeTitle">{{item.name}}</div>
                    <div class="typeDesc">{{item.info}}</div>
                    <span v-show="selectedType.id == item.id"></span>
                </div>
            </div>
            <div class="gap contentItem dateContainer bdr-t bdr-b">
                <div class="dateItem bdr-b row">
                    <span class="col">开始日期</span>
                    <span class="content col-center space">{{beginDateStr}}({{beginDateDayOfWeek}})</span>
                </div>
                <div class="dateItem bdr-b row">
                    <span class="col">结束日期</span>
                    <span class="content col-center space">{{endDateStr}}({{endDateDayOfWeek}})</span>
                </div>
                <div class="dateItem row">
                    选择开始日期
                </div>

                <div class="dateList flex typeContainer bdr-b">
                    <div class="item" v-for="(date, index) in dateList"
                         @click="beginDate = date.date"
                         :class="{selected: beginDate && date.date.getDate() == beginDate.getDate()}">
                        <div class="dateStr flex center-content center-child">{{date.dateStr}}</div>
                        <div class="dayOfWeek">{{date.dayOfWeek}}</div>
                    </div>
                </div>

                <div class="dateItem row" v-show="selectedType.id != 3">
                    <div class="title col-center col">申请天数</div>
                    <div class="col-center row flex center-child" style="width: initial; height: 27px;">
                        <span class="iconMinus iconBg mathSymbol"
                              @click="minusApplyDay"></span>
                        <span class="applyDayNum">
                            <input type="number" v-model="applyDayNum">
                        </span>
                        <span class="iconPlus iconBg mathSymbol"
                              @click="addApplyDay"></span>
                    </div>
                </div>

            </div>

            <div class="gap cityContainer bdr-t bdr-b contentItem">
                <div class="dateItem row" style="padding: 5px;">
                    选择城市（点击城市可删除）
                </div>
                <div v-show="selectCityTip"
                     class="selectCityTip dateItem textGray smallFont row flex center-child">
                    <div class="col-center">{{selectCityTip}}</div>
                </div>

                <div class="cityItem flex center-child" :class="{record: city.isRecord}"
                     v-for="(city, index) in cityList" @click="removeCity(index)">
                    <div>{{city.cityName}}</div>
                </div>
                <div class="cityItem addCityBtn" @click="selectCity">+</div>
            </div>

            <div class="gap bdr-b bdr-t" style="background:white">
                <textarea class="default"
                          id="applyReason"
                          placeholder="请填写申请理由，如：常州市城管局。（四个字以上）"
                          rows="3"
                          v-model="applyReason">
                </textarea>
            </div>

            <div class="gap bdr-t bdr-b dateContainer contentItem">
                <div class="dateItem row bdr-b">
                    <span class="col col-center">提交到</span>
                    <span class="content col-center space">{{seniorName}}</span>
                </div>
                <div class="dateItem row" @click="isSendMessage = !isSendMessage">
                    <span class="col col-center">发送短信</span>
                    <span class="iconBg iconSendMsg col-center"
                          :class="[isSendMessage ? 'sendMsgActive' : 'sendMsgNormal']"></span>
                </div>
            </div>
            <div style="height:60px"></div>
        </div>

        <div class="bottomSection bdr-t flex center-child center-content" @click="saveCheckApply">
            <span class="bottomBtnImg col-center"></span>
            <span class="col-center">提交</span>
        </div>
    </div>
</template>
<style scoped>
    .mint-content .gap {
        margin-top: 7px;
    }

    .mint-cell {
        min-height: 40px;
    }

    #applyReason {
        margin-top: 0;
    }

    .bdr-b, .bdr-t {
        z-index: 0;
    }

    .bdr-b::after, .bdr-t::before {
        border-bottom-color: #d9d9d9;
    }

    span.recordInfo {
        color: #FC9449;
        font-size: 11px;
        padding-right: 10px;
    }

    .bottomBtnImg {
        background-image: url('../../image/icon_btn_save.png');
    }

    .sendMsgActive {
        background-image: url('../../image/icon_btn_check.png');
    }

    .sendMsgNormal {
        background-image: url('../../image/icon_btn_uncheck.png');
    }

    .contentItem {
        padding: 10px;
        background-color: white;
    }

    .typeContainer {
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
    }

    .banner {
        font-size: 12px;
        padding: 8px 12px;
        color: #929292;
    }

    .type {
        padding: 8px 14px;
        color: #929292;
        background-color: #EEEFF3;
        border-radius: 5px;
        position: relative;
    }

    .type.typeSelected {
        color: white;
        background-color: #37AEFF;
        border: 0;
    }

    .type span {
        display: inline-block;
        position: absolute;
        right: 0;
        top: 0;
        height: 29px;
        width: 27px;
        background-size: cover;
        background-image: url('../../image/icon_selected_triangle.png');
    }

    .typeTitle {
        text-align: center;
        font-size: 16px;
    }

    .typeDesc {
        font-size: 14px;
    }

    .dateContainer.contentItem {
        padding: 0 0 0 10px;
    }

    .dateItem {
        padding-top: 10px;
        padding-right: 10px;
        padding-bottom: 10px;
        color: #ABABAC;
    }

    .dateItem .content {
        color: #323334;
    }

    .dateList {
        padding-bottom: 10px;
        padding-right: 10px;
    }

    .dateStr {
        height: 28px;
        width: 28px;
        background-color: #E5EBEF;
        border-radius: 14px;
        color: #929292;
        font-size: 10px;
    }

    .dateList .item.selected .dateStr {
        background-color: #37AEFF;
        color: white;
    }

    .dayOfWeek {
        font-size: 10px;
        color: #ABABAC;
        text-align: center;
        margin-top: 3px;
    }

    .dateList .item.selected .dayOfWeek {
        color: #37AEFF;
    }

    .mathSymbol {
        width: 27px;
        height: 27px;
        display: inline-block;
        margin-right: 0;
    }

    .iconMinus {
        background-image: url('../../image/icon_minus.png');
    }

    .iconPlus {
        background-image: url('../../image/icon_plus.png');
    }

    .applyDayNum {
        width: 54px;
        margin-left: 5px;
        margin-right: 5px;
        height: 27px;
        display: inline-block;
        position: relative;
    }

    /* Android 4.3 以及 iOS8 input无法直线排列，
     * 使用下面这种方法得到正确的布局
     */
    .applyDayNum input {
        width: 100%;
        height: 100%;
        background-color: #F7F7F7;
        border: 1px solid #DFDFDF;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        text-align: center;
    }

    .cityContainer {
        overflow: hidden;
        padding: 5px;
    }

    .cityItem {
        padding: 5px;
        float: left;
        background-color: #6CC198;
        border-radius: 5px;
        text-align: center;
        color: white;
        margin: 5px;
        height: 54px;
        position: relative;
    }

    .cityItem.addCityBtn {
        padding: 0;
        background-color: #E5EBEF;
        color: #929292;
        font-size: 25px;
        width: 54px;
        line-height: 54px;
    }

    .cityItem i {
        top: -3px;
        right: -3px;
        position: absolute;
        color: #555;
    }

    .dateItem .tagBrown {
        font-size: 12px;
        margin-left: 15px;
    }

    .iconBg.iconSendMsg {
        width: 15px;
        height: 15px;
    }

    .record {
        background-color: #37AEFF;
    }

    .selectCityTip {
        padding: 5px;
        color: #FF9517;
    }
</style>
<script>
    import {Indicator, MessageBox, Toast} from 'mint-ui'

    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import dateUtil from 'DateUtil'
    import {bindNavBar} from 'egovanative'
    import {getCurrentProvinceAndCity} from '../record/locationManager'

    const KEY_LAST_ADDRESS = "add_apply_last_city_list"
    const KEY_LAST_REASON = "add_apply_last_reason"

    const TYPE_CHU_CHAI = 1
    const TYPE_ZUO_BAN = 2
    const TYPE_GONG_CHU = 3

    const typeList = [{id: TYPE_CHU_CHAI, name: '出差', info: '可申请7天', maxApplyNum: 7, maxCityNum: 1000},
        {id: TYPE_ZUO_BAN, name: '坐班', info: '可申请30天', maxApplyNum: 30, maxCityNum: 1},
        {id: TYPE_GONG_CHU, name: '公出', info: '可申请1天', maxApplyNum: 1, maxCityNum: 1}]

    function defaultData() {
        return {
            beginDate: null,
            seniorName: '',
            applyReason: '',
            callback: null,
            selectedType: typeList[0],
            isSendMessage: false,
            typeList: typeList,
            applyDayNum: 0,//申请的天数
            cityList: []
        }
    }

    export default{
        data() {
            return defaultData()
        },
        methods: {
            addApplyDay() {
                if (this.applyDayNum >= this.selectedType.maxApplyNum) {
                    this.applyDayNum = this.selectedType.maxApplyNum
                    Toast(`在类型“${this.selectedType.name}”下最多只能申请${this.selectedType.maxApplyNum}天`)
                    return
                }
                this.applyDayNum++
            },
            minusApplyDay() {
                if (this.applyDayNum <= 1) {
                    this.applyDayNum = 1
                    Toast(`至少需要申请1天`)
                    return
                }
                this.applyDayNum--
            },
            removeCity(index) {
                MessageBox.confirm('确定删除？').then(action => {
                    this.cityList.splice(index, 1)
                }, cancel=> {
                })
            },
            goHelp() {
                this.$router.push({name: 'applyHelp'})
            },
            goBack() {
                Util.goBack()
            },
            formatDate(date) {
                return dateUtil.formatDateByDate(date, dateUtil.FORMAT_YMD)
            },
            addCityCallback(province, city, addToFirst) {
                Util.removeItemFromList(this.cityList, (item, index) => {
                    return item.id == city.id
                })

                if (this.selectedType.maxCityNum == 1 && this.cityList.length > 0) {
                    //正常情况下选择城市不会出现在只能选择一个城市的类型中出现多个城市，但当获取
                    //当前城市等待的比较久时就会发生这种情况，这里将之前的列表清空
                    this.cityList.splice(0, this.cityList.length, city)
                } else {
                    this.cityList.splice(addToFirst ? 0 : this.cityList.length, 0, city)
                }
            },
            selectCity() {
                if (this.cityList.length > 0) {
                    if (this.selectedType.id == TYPE_GONG_CHU || this.selectedType.id == TYPE_ZUO_BAN) {
                        Toast(`在类型“${this.selectedType.name}”下最多只能选择一个城市，请删除后添加`)
                        return
                    }
                }
                this.$router.push({
                    name: 'selectCity',
                    params: {
                        selectedCity: null,
                        selectedProvince: null,
                        callback: this.addCityCallback
                    }
                })
            },
            saveCheckApply() {
                if (!this.checkInputValid()) {
                    return
                }
                Indicator.open()

                let cityIds = '', baiduCodes = ''
                this.cityList.map(city => {
                    if (cityIds.length > 0) {
                        cityIds += ','
                        baiduCodes += ','
                    }
                    cityIds += city.id
                    baiduCodes += city.baiduCode
                })

                http.ajax({
                    functionName: "mi/checkapply/savecheckapply",
                    params: {
                        humanID: gData.humanID,
                        beginTime: this.beginDateStr,
                        endTime: this.endDateStr,
                        applyReason: this.applyReason,
                        cityIds: cityIds,
                        applyType: this.selectedType.id,
                        baiduCodes: baiduCodes,
                        isSendMessage: this.isSendMessage ? 1 : 0
                    },
                    success: (data) => {
                        if (data.success) {
                            Toast("提交申请成功")
                            //保存上一次选择的地址，使得下次进入时自动选择
                            Util.saveObject(KEY_LAST_ADDRESS, this.cityList)
                            Util.saveObject(KEY_LAST_REASON, this.applyReason)
                            if (this.callback) {
                                this.callback()
                            }
                            this.goBack(true)
                        } else {
                            Toast(data.message)
                        }
                    },
                    error: function (data) {
                        Toast("添加记录错误:" + data)
                    },
                    finally: () => {
                        Indicator.close()
                    }
                })
            },

            checkInputValid () {
                if (this.beginDateStr.localeCompare(this.endDateStr) > 1) {
                    Toast("开始时间不能大于结束时间")
                    return false
                }

                if (!this.seniorName) {
                    Toast("正在获取审批人信息中，请稍后...")
                    return false
                }
                if (this.cityList.length == 0) {
                    Toast("目标城市不能为空")
                    return false
                }

                if (!this.applyReason) {
                    Toast("申请理由不能为空")
                    return false
                }

                return true
            },

            getSeniorName() {
                http.ajax({
                    functionName: "mi/checkapply/getverifyhuman",
                    params: {
                        humanID: gData.humanID,
                    },
                    success: (data) => {
                        if (data && data.success) {
                            data = data.data
                            if (data && data.senior) {
                                this.seniorName = data.senior.humanName
                            }
                        }
                    }
                })
            },
            initOnCreate() {
                this.getSeniorName()
                this.beginDate = new Date()
                this.applyDayNum = this.selectedType.maxApplyNum;
                this.cityList = Util.getObjectByKey(KEY_LAST_ADDRESS) || []
                this.applyReason = Util.getObjectByKey(KEY_LAST_REASON) || ''
                getCurrentProvinceAndCity((province, city) => {
                    // Only well-formed is allowed
                    if (city && city.id && city.baiduCode) {
                        this.addCityCallback(province, city, true)
                    }
                })
            }

        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                bindNavBar('新增考勤申请', '帮助', () => {
                    vm.goHelp()
                })
                if (vm.isNewPage(to)) {
                    Util.resetObject(vm, defaultData())
                    vm.initOnCreate()
                    vm.callback = vm.$route.params && vm.$route.params.callback
                }
            })
        },
        watch: {
            applyDayNum(val) {
                if (val > this.selectedType.maxApplyNum) {
                    this.applyDayNum = this.selectedType.maxApplyNum
                } else if (typeof val == 'number' && val < 1) {
                    this.applyDayNum = 1
                }
            },
            selectedType(val) {
                this.applyDayNum = val.maxApplyNum

                //坐班或公出只能选择一个城市
                if (val.maxCityNum == 1) {
                    if (this.cityList.length > 1) {
                        this.cityList = [this.cityList[0]]
                    }
                }
            }
        },
        computed: {
            endDate() {
                if (!this.beginDate) return new Date()
                return dateUtil.addDays(this.beginDate, this.applyDayNum - 1)
            },
            beginDateStr() {
                if (!this.beginDate) return ''
                return this.formatDate(this.beginDate)
            },
            beginDateDayOfWeek() {
                if (!this.beginDate) return ''
                return dateUtil.getWeek(this.beginDate)
            },
            endDateStr() {
                if (!this.endDate) return ''
                return this.formatDate(this.endDate)
            },
            endDateDayOfWeek() {
                if (!this.endDate) return ''
                return dateUtil.getWeek(this.endDate)
            },
            sendMessageText() {
                return this.isSendMessage ? "发送" : "不发送"
            },
            dateList() {
                let list = new Array(7)
                let today = new Date()
                for (let i = 0; i < 7; i++) {
                    let date = dateUtil.addDays(today, i)
                    list[i] = {
                        date: date,
                        dateStr: date.getDate(),
                        dayOfWeek: dateUtil.getWeek(date)
                    }
                }
                return list
            },
            selectCityTip() {
                if (this.selectedType.id == TYPE_CHU_CHAI && this.cityList.length < 2) {
                    return '请选择出发城市和目的城市'
                } else {
                    return null
                }
            }
        }
    }
</script>
