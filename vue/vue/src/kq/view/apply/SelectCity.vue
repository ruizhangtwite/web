<template>
    <div>
        <mt-header fixed title="选择出差地点"></mt-header>
        <div class="mint-content">
            <div class="section" v-if="recordList.length > 0">
                <div class="section-header bdr-t bdr-b">备案地点</div>
                <div class="flowContainer bdr-b">
                    <div v-for="item in recordList" class="flowItem" @click="clickRecordItem(item)">
                        {{item.cityName}}
                        <i class="icon-ok"
                           :style="{visibility: selectedRecordCity==item ? 'visible' : 'hidden'}"></i>
                    </div>
                </div>
            </div>
            <div class="section">
                <div class="section-header bdr-t bdr-b">
                    其他城市
                    <i class="icon-ok" v-show="selectedCity"></i>
                </div>
                <div class="otherContainer row bdr-b">
                    <div class="otherItem col" @click="selectProvince">
                        {{selectedProvince ? selectedProvince.provinceName : ''}}
                        <i class="icon-angle-down"></i>
                    </div>
                    <div class="otherItem col" @click="selectCity">
                        {{selectedCity ? selectedCity.cityName : ''}}
                        <i class="icon-angle-down"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="bottomSection bdr-t flex center-child center-content" @click="confirm">
            <i class="bottomBtnImg col-center"></i>
            <span class="col-center">确定</span>
        </div>
        <mt-actionsheet
                :actions="sheetList"
                cancelText=""
                v-model="sheetVisible">
        </mt-actionsheet>
    </div>
</template>
<style scoped>
    .icon-ok {
        color: #0BD308;
    }

    .mint-content {
        bottom: 48px;
    }

    .otherContainer.row {
        padding: 10px 15px;
    }

    .otherItem:first-child {
        margin-right: 10px;
    }

    .otherItem:last-child {
        margin-left: 10px;
    }

    .otherItem.col {
        color: #1EABFD;
        border-radius: 4px;
        border: 1px #1EABFD solid;
        background-color: #EFF9FF;
        height: 30px;
        line-height: 30px;
        font-size: 15px;
        padding: 0 25px 0 10px;
        position: relative;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .icon-angle-down {
        position: absolute;
        right: 10px;
        top: 7px; /* icon height is 16, container height is 30 ===> (30 - 16) / 2 = 7*/
    }

    .mint-actionsheet {
        max-height: 400px;
        overflow: auto;
    }
    
    .bottomBtnImg {
        background-image: url("../../image/icon_btn_check.png");
    }

</style>
<script>
    import {Indicator} from 'mint-ui'
    import {Toast} from 'mint-ui'

    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import {bindNavBar} from 'egovanative'

    function defaultData() {
        return {
            recordList: [],
            selectedProvince: null,

            /**
             * selectedCity和selectedRecordCity只能二选一，当选中其中一个，
             * 另外一个将被置为null。正常情况下，选择了selectedCity，必然也
             * 会选择selectedProvince
             */
            selectedCity: null,
            selectedRecordCity: null,

            provinceList: [],
            cityList: [],

            sheetList: [],
            sheetVisible: false,
            cityCache: {},
            params: {}
        }
    }
    export default{
        data() {
            return defaultData()
        },
        methods: {
            clickRecordItem(item) {
                this.selectedRecordCity = item
                this.selectedCity = null
            },
            selectProvince() {
                if (this.provinceList.length > 0) {
                    this.sheetVisible = true
                    this.sheetList = this.provinceList
                } else {
                    Toast("正在加载省份数据...")
                }
            },
            selectCity() {
                if (this.cityList.length > 0) {
                    this.sheetVisible = true
                    this.sheetList = this.cityList
                } else {
                    Toast("正在加载城市数据...")
                }
            },
            getRecordData() {
                http.ajax({
                    functionName: "/mi/getbackupcitylist",
                    params: {
                        humanID: gData.humanID
                    },
                    success: (data) => {
                        if (data && data.success && data.data) {
                            data = data.data
                            if (data.list && data.list.length > 0) {
                                this.recordList = data.list

                                //将传入的备案地点替换为最新的对象，因为是通过对象是否相等来判断选中的状态
                                if (this.params.selectedRecordCity) {
                                    let findItem = this.findCityItem(this.recordList, this.params.selectedRecordCity)
                                    if (findItem) {
                                        this.selectedRecordCity = findItem
                                    }

                                    if (this.cityList.length > 0) {
                                        //说明城市列表第一次加载完毕，this.selectedRecordCity不会被覆盖了，
                                        //另外一种情况是备案城市列表先加载完毕，参见onGetCityListSuccess()
                                        this.params.selectedRecordCity = null
                                    }
                                }
                            }
                        }
                    }
                })
            },
            getProvinceData() {
                http.ajax({
                    functionName: "/common/provinceandcity/getallprovinces",
                    success: (data) => {
                        if (data && data.success && data.data) {
                            data = data.data
                            if (data.list && data.list.length > 0) {
                                data.list.map(item => {
                                    item.name = item.provinceName
                                    item.method = () => {
                                        this.onSelectProvince(item)
                                    }
                                })
                                this.provinceList = data.list
                                this.onGetProvinceListSuccess()
                            }
                        }
                    }
                })
            },
            getCityData() {
                var provinceID = this.selectedProvince.id
                http.ajax({
                    functionName: "/common/provinceandcity/getcitysofprovince",
                    params: {
                        provinceID: provinceID
                    },
                    success: (data) => {
                        if (data && data.success && data.data) {
                            data = data.data
                            if (data.list && data.list.length > 0) {
                                data.list.map(item => {
                                    item.name = item.cityName
                                    item.method = () => {
                                        this.onSelectCity(item)
                                    }
                                })
                                this.cityList = data.list
                                this.cityCache[provinceID] = this.cityList
                                this.onGetCityListSuccess()
                            }
                        }
                    }
                })
            },
            onSelectCity(city) {
                this.selectedCity = city
                this.selectedRecordCity = null
            },
            onSelectProvince(province) {
                this.selectedProvince = province
                this.selectedCity = null

                var cache = this.cityCache[province.id]
                if (cache) {
                    this.cityList = cache
                    this.onGetCityListSuccess()
                } else {
                    this.cityList = []
                    this.getCityData()
                }
            },

            findCityItem(cityList, originCity) {
                let findItem
                cityList.map(item => {
                    if (item.id == originCity.id) {
                        findItem = item
                    }
                })
                return findItem
            },
            onGetCityListSuccess() {
                if (this.params.selectedCity) {
                    this.selectedCity = this.params.selectedCity
                    this.params.selectedCity = null
                    let findItem = this.findCityItem(this.cityList, this.selectedCity)

                    //此时，用户可能已经切换省份了，所以不一定找得到相应的城市，
                    //如果找不到，则默认选择第一个城市
                    if (findItem) {
                        this.selectedCity = findItem
                        this.onSelectCity(findItem)
                        return
                    }
                } else if (this.params.selectedRecordCity && this.selectedRecordCity) {
                    // 说明备案地点列表先加载完毕，并且已经选中了传入的城市，如果继续往下执行，
                    // onSelectCity(city)将会覆盖选中的selectedRecordCity

                    // 另外一种情况是城市列表先加载完毕，参见getRecordData()
                    this.params.selectedRecordCity = null
                    return
                }

                if (this.cityList.length > 0) {
                    this.onSelectCity(this.cityList[0])
                }
            },
            confirm() {
                if (!this.selectedCity && !this.selectedRecordCity) {
                    Toast('尚未选择城市')
                } else {
                    var callback = this.$route.params.callback
                    if (callback) {
                        if (this.selectedCity) {
                            callback(this.selectedProvince, this.decorateRecordCity(this.selectedCity))
                        } else {
                            this.selectedRecordCity.isRecord = true
                            callback(null, this.selectedRecordCity)
                        }
                    }
                    Util.goBack()
                }
            },
            onGetProvinceListSuccess() {
                if (this.params.selectedProvince) {
                    this.selectedProvince = this.params.selectedProvince
                    this.params.selectedProvince = null
                    this.provinceList.map(item => {
                        if (item.id == this.selectedProvince.id) {
                            this.selectedProvince = item
                        }
                    })
                    this.onSelectProvince(this.selectedProvince)
                } else {
                    this.onSelectProvince(this.provinceList[0])
                }
            },
            decorateRecordCity(city) {
                this.recordList && this.recordList.map(item => {
                    city.isRecord = city.isRecord || city.id == item.id
                })
                return city
            },
            initOnCreate() {
                this.params.selectedProvince = this.$route.params.selectedProvince
                let city = this.$route.params.selectedCity
                if (this.params.selectedProvince) {
                    this.params.selectedCity = city
                } else {
                    this.params.selectedRecordCity = city
                }

                this.getProvinceData()
                this.getRecordData()
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                Util.resetObject(vm, defaultData())
                bindNavBar('选择出差地点')
                vm.initOnCreate()
            })
        }
    }
</script>
