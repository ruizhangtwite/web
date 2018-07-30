import sysConfig from 'sysConfig'
import {resolveResultData} from 'ListManager';
import dateUtil from 'DateUtil'

export function getClientType(id) {
    switch (id) {
        case 1:
            return "android客户端"
        case 2:
            return "iOS客户端"
        case 3:
            return "指纹机"
        case 4:
            return "情况说明修复记录"
        case 5:
            return "html5"
        default:
            return ''
    }
}

export function buildTagList(item) {
    let tagList = []
    if (item.earlyExceptionFlag == 1) {
        tagList.push({
            name: '早退',
            color: sysConfig.getLegendColor(sysConfig.LEGEND_LATER_OR_EARLY)
        })
    }
    if (item.laterExceptionFlag == 1) {
        tagList.push({
            name: '迟到',
            color: sysConfig.getLegendColor(sysConfig.LEGEND_LATER_OR_EARLY)
        })
    }
    if (item.siteExceptionFlag == 1) {
        tagList.push({
            name: '位置异常',
            color: sysConfig.getLegendColor(sysConfig.LEGEND_EXCEPTION)
        })
    }
    if (item.checkExceptionFlag == 1) {
        tagList.push({
            name: '代打卡',
            color: sysConfig.getLegendColor(sysConfig.LEGEND_EXCEPTION)
        })
    }
    return tagList
}

export function isDateEqual(left, right) {
    if (!left || !right) {
        return false;
    }
    return left.localeCompare(right) == 0;
}

export function listParser(isRefresh, data) {
    if (data && data.success && data.data) {
        let content = data.data
        if ((typeof content.identifyFlag) != 'undefined') {
            this.identifyFlag = content.identifyFlag
        }
    }

    let lastDateText = null
    let parser = function (item) {
        let clientText = getClientType(item.clientTypeID)
        let checkLead = item.checkType == 1 ? '签到' : '签退'
        let date = dateUtil.parseDate(item.checkTime)
        let dateText = `${dateUtil.formatDateByDate(date, dateUtil.FORMAT_YMD)} ${dateUtil.getWeek(date)}`

        let showDateInfo = !(lastDateText && isDateEqual(dateText, lastDateText))
        lastDateText = dateText
        return {
            clientType: clientText,
            remark: item.remark,
            checkDate: dateText,
            checkTimeText: `${checkLead}：${dateUtil.formatDateByDate(date, dateUtil.FORMAT_HM)}`,
            tagList: buildTagList(item),
            showDateInfo: showDateInfo,
            checkTime: item.checkTime
        }
    }
    resolveResultData.call(this, data, isRefresh, parser, sysConfig.COUNT_PER_PAGE)
}

export default function buildParser(vm) {
    return function (isRefresh, data) {
        listParser.call(vm, isRefresh, data)
    }
}
