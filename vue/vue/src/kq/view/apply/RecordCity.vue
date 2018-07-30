<template>
    <div>
        <mt-header fixed title="备案城市"></mt-header>
        <div class="mint-content">
            <div class="flowContainer" v-show="recordList.length > 0">
                <div v-for="item in recordList" class="flowItem">
                    {{item.cityName}}
                </div>
            </div>
            <div class="sectionEmpty" v-show="hasInit && recordList.length == 0">
                没有备案城市
            </div>
        </div>
    </div>
</template>
<style scoped>
    .flowContainer {
        background-color: white;
    }
</style>
<script>
    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import {Indicator, Toast} from 'mint-ui'
    import {bindNavBar} from 'egovanative';

    function defaultData() {
        return {
            hasInit: false,
            recordList: []
        }
    }
    export default{
        data(){
            return defaultData()
        },
        methods: {
            getRecordData() {
                let humanID = this.$route.params.humanID
                if (!humanID || humanID == 'null') {
                    Toast('未传入正确的人员id')
                    return
                }
                http.ajax({
                    functionName: "/mi/getbackupcitylist",
                    params: {
                        humanID: humanID
                    },
                    start: () => {
                        Indicator.open()
                    },
                    success: (data) => {
                        this.hasInit = true
                        if (data && data.success && data.data) {
                            data = data.data
                            if (data.list && data.list.length > 0) {
                                this.recordList = data.list
                            }
                        }
                    },
                    finally: () => {
                        Indicator.close()
                    }
                })
            },
            init() {
                Util.resetObject(this, defaultData())
                this.getRecordData()
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.init()
                bindNavBar('备案城市')
            })
        }
    }
</script>
