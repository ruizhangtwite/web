import {parseApplyState, parseStateStyle, isShowSignInTime, isShowSignOutTime} from '../TabManager'
import dateUtil from 'DateUtil'
import {data as gData} from 'zhixin'
import sysConfig from 'sysConfig'

export function caseParser(item) {
    onStateChange.call(this, item)
    item.isShowSignInTime = isShowSignInTime(item.explainType)
    item.isShowSignOutTime = isShowSignOutTime(item.explainType)
    item.isShowSignTime = item.isShowSignInTime || item.isShowSignOutTime
    item.showHumanName = true

    var isSelf = gData.humanID == item.humanID
    item.showDeleteBtn = isSelf
    if (!isSelf) {
        this.$set(item, 'showActionBtn', item.applyState === sysConfig.CHECK_NEW)
    }

    item.replyInfo = `${item.replyHumanName}${getReplyTime(item)}`

    item.checkLog = parseCheckLog(item.checkLog, item.explainType)
}

export function onStateChange(item) {
    this.$set(item, 'applyStateText', parseApplyState(item.applyState))
    this.$set(item, 'stateStyle', parseStateStyle(item.applyState))
    this.$set(item, 'showAction', item.applyState === sysConfig.CHECK_NEW)
}


function getReplyTime(item) {
    if (item.applyState == sysConfig.CHECK_YES
        || item.applyState == sysConfig.CHECK_NO) {
        var date = dateUtil.parseDate(item.replyTime)
        return '   ' + dateUtil.formatDateByDate(date, dateUtil.FORMAT_YMDHM)
    }
    return ''
}

export function parseCheckLog(checkLog, explainType) {
    checkLog = checkLog || {}

    checkLog.isSiteException = isSiteException(explainType)

    checkLog.checkTime = checkLog.checkTime && dateUtil.formatDateByDate(
            dateUtil.parseDate(checkLog.checkTime), dateUtil.FORMAT_HM)
    if (explainType == sysConfig.EXPLAIN_TYPE_SITE_EXCEPTION_IN) {
        checkLog.type = '签到'
    } else if (explainType == sysConfig.EXPLAIN_TYPE_SITE_EXCEPTION_OUT) {
        checkLog.type = '签退'
    }
    return checkLog
}

function isSiteException(explainType) {
    return explainType == sysConfig.EXPLAIN_TYPE_SITE_EXCEPTION_IN ||
        explainType == sysConfig.EXPLAIN_TYPE_SITE_EXCEPTION_OUT
}
