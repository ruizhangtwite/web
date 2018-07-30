import Util from 'Util'
import sysConfig from 'sysConfig'

var baseData = () => ({
    hasMore: true,
    dataList: [],
    totalCount: 0,
    isLoading: false,
})

var baseComputed = {
    disableLoad() {
        return !this.hasMore
    },
    isEmpty() {
        return !this.hasMore && this.dataList.length == 0
    },
    hasInit() {
        return !this.hasMore || this.dataList.length > 0
    },
}

function resolveResultData(data, isRefresh, parser) {
    try {
        if (data && data.success && data.data) {
            data = data.data
            if (isRefresh) {
                Util.clearList(this.dataList)
                this.hasMore = true
            }

            var loadedList = data.list
            if (!loadedList || loadedList.length == 0) {
                this.hasMore = false
                return
            }

            if (loadedList.length < sysConfig.COUNT_PER_PAGE) {
                this.hasMore = false
            }

            loadedList.map(item => {
                if (parser) parser.call(this, item)
                this.dataList.push(item)
            })

            if (data.allCount) {
                this.totalCount = data.allCount
            } else {
                this.totalCount = this.dataList.length
            }

        } else {
            console.log(`加载列表失败:${data.message}`)
        }
    } catch (e) {
        console.log("加载列表错误：")
        console.log(e)
    }
}

function parseApplyState(applyState, humanName) {
    switch (applyState) {
        case sysConfig.CHECK_NEW:
            return humanName ? `审批中(${humanName})` : '审批中'
        case sysConfig.CHECK_YES:
            return "已通过"
        case sysConfig.CHECK_NO:
            return "未通过"
        default:
            return `未知状态：${applyState}`
    }
}

function isShowSignInTime(explainType) {
    //上午缺勤或旷工
    return explainType == sysConfig.EXPLAIN_TYPE_QUEQIN_AM
        || explainType == sysConfig.EXPLAIN_TYPE_KUANGGONG
}

function isShowSignOutTime(explainType) {
    //下午缺勤或旷工
    return explainType === sysConfig.EXPLAIN_TYPE_QUEQIN_PM
        || explainType === sysConfig.EXPLAIN_TYPE_KUANGGONG
}

function parseStateStyle(applyState) {
    var style = {tagBrown: true}
    switch (applyState) {
        case sysConfig.CHECK_YES:
            style = {tagGreen: true}
            break
        case sysConfig.CHECK_NO:
            style = {tagRed: true}
            break
    }
    return style
}

function mockDataList(type) {
    return []
}

//如果还没有初始化则加载列表
function loadAsNeed(vm) {
    if (vm.hasMore && vm.dataList.length == 0) {
        vm.loadData(true)
    }
}

//如果初始化了则刷新列表
function refreshAsNeed(vm) {
    if (!vm.hasMore || vm.dataList.length > 0) {
        vm.loadData(true)
    }
}

function finishLoad() {
    this.isLoading = false
}

function startLoad() {
    this.isLoading = true
}

export {
    baseData,
    baseComputed,
    resolveResultData,
    mockDataList,
    parseApplyState,
    isShowSignInTime,
    isShowSignOutTime,
    parseStateStyle,
    loadAsNeed,
    refreshAsNeed,
    startLoad,
    finishLoad
}