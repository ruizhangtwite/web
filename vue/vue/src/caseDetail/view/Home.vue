<template>
    <div>
        <div class="mint-content"
             style='top: 57px'>
    
            <div v-infinite-scroll="loadData"
                 infinite-scroll-disabled="disableLoad"
                 infinite-scroll-distance="10"
                 infinite-scroll-immediate-check="false">
    
                <div>
                    <detailHeader></detailHeader>
                </div>
                <div v-for="item in dataList" class='bdr-b'><commentCell></commentCell></div>
            </div>
        </div>
    </div>
</template>
<style scoped>

</style>

<script>
import { Navbar, TabItem, Indicator, MessageBox, Toast, InfiniteScroll } from 'mint-ui';
import Util from 'Util'
import dateUtil from 'DateUtil'
import { data as gData } from 'zhixin'
import http from 'Http'
import sysConfig from 'sysConfig'
import { bindNavBar } from 'egovanative'
import { baseData, baseComputed, resolveHasMore, resolveResultData } from 'ListManager';

import detailHeader from '../widget/detailHeader.vue';
import commentCell  from '../widget/commentCell.vue';

function defaultData() {
    return {
        ...baseData(),

        dataList: ["1", "2", "2", "2", "2", "2", "2"],
        humanID: gData.humanID,
    }
}

export default {
    data() {
        return defaultData()
    },
    components: {
        'detailHeader': detailHeader,
        'commentCell':commentCell
    },
    computed: {
        ...baseComputed
    },
    methods: {
        init() {
        },
        loadData() {

        },

        loadMore() {
        }
    },

    beforeRouteEnter(to, from, next) {
        next(vm => {
            vm.init()
            bindNavBar('案卷详情')
        })
    }
}
</script>