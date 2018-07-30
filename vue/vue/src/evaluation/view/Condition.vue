<template>
    <div class="mint-content">
        <mt-header fixed title="搜索"></mt-header>
        <mt-cell class="bdr-t bdr-b" title="开始时间" is-link @click.native="selectStartDate">{{startDateText}}</mt-cell>
        <mt-cell class="bdr-b" title="结束时间" is-link @click.native="selectEndDate">{{endDateText}}</mt-cell>
        <mt-cell class="bdr-b" title="周期" v-if="showRegion" is-link @click.native="selectRegion">{{region}}
        </mt-cell>
        <mt-button class="btn-confirm" type="default" @click.native="confirm">确定</mt-button>
        <mt-datetime-picker
                ref="datePicker"
                @confirm="onDateSelect"
                v-model="currentDate"
                type="date">
        </mt-datetime-picker>

        <mt-actionsheet
                :actions="regionList"
                v-model="sheetVisible">
        </mt-actionsheet>
    </div>
</template>
<style scoped>
    .btn-confirm {
        width: 90%;
        margin: 25px 0 0 5%;
    }

    .mint-content {
        padding: 10px 0;
    }
</style>
<script>
    import DateUtil from 'DateUtil'
    import Util from 'Util'
    import {Toast} from 'mint-ui'
    import {bindNavBar} from 'egovanative'

    function defaultData() {
        return {
            startDate: null,
            endDate: null,
            selRegion: null,
            showRegion: false,
            isSelectStart: false,
            currentDate: new Date(),
            region: null,
            sheetVisible: false
        }
    }
    export default{
        data(){
            return defaultData()
        },
        computed: {
            startDateText() {
                if (this.startDate) {
                    return DateUtil.formatDateByDate(this.startDate, DateUtil.FORMAT_YMD)
                }
                return ''
            },
            endDateText() {
                if (this.endDate) {
                    return DateUtil.formatDateByDate(this.endDate, DateUtil.FORMAT_YMD)
                }
                return ''
            },
            regionList() {
                var list = ['日', '月', '季度']
                return list.map(item=> {
                    return {
                        name: item,
                        method: ()=> {
                            this.onSelectRegion(item)
                        }
                    }
                })
            },
        },
        methods: {
            selectStartDate() {
                this.isSelectStart = true
                this.currentDate = this.startDate
                this.openPicker()
            },
            selectEndDate() {
                this.isSelectStart = false
                this.currentDate = this.endDate
                this.openPicker()
            },
            openPicker() {
                this.$refs.datePicker.open()
            },
            onDateSelect(value) {
                if (this.isSelectStart) {
                    this.startDate = value
                } else {
                    this.endDate = value
                }
            },
            init() {
                Util.resetObject(this, defaultData())
                let params = this.$route.params
                this.startDate = params.startDate ? params.startDate : new Date()
                if (params.endDate) {
                    this.endDate = params.endDate
                } else {
                    this.endDate = new Date()
                    this.endDate.setDate(this.startDate.getDate() + 1)
                }

                if (params.child && (params.child.id == "trend"
                        || params.child.id == "tongbi"
                        || params.child.id == "huanbi")) {
                    this.showRegion = true;
                }
            },
            selectRegion() {
                this.sheetVisible = true
            },
            onSelectRegion(item) {
                this.region = item
            },
            confirm() {
                if (this.startDateText.localeCompare(this.endDateText) > 0) {
                    Toast('开始时间不能比结束时间晚')
                    return
                }
                Util.doCallback(this, {
                    startDate: this.startDate,
                    endDate: this.endDate,
                    region: this.region
                })
                Util.goBack()
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (vm.isNewPage(to)) {
                    vm.init()
                }
                bindNavBar('搜索')
            })
        }
    }
</script>
