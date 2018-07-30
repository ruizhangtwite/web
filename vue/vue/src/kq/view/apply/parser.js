import {parseApplyState, parseStateStyle, isShowSignInTime, isShowSignOutTime} from '../TabManager'
import dateUtil from 'DateUtil'
import {data as gData} from 'zhixin'
import sysConfig from 'sysConfig'

function parseTime(time) {
    var date = dateUtil.parseDate(time)
    return date ? dateUtil.formatDateByDate(date, dateUtil.FORMAT_YMD) : ''
}


function caseParser(item) {
    item.checkTime = `${parseTime(item.beginTime)}至${parseTime(item.endTime)}`
    this.$set(item, 'stateStyle', parseStateStyle(item.applyState))
    this.$set(item, 'applyStateText', parseApplyState(item.applyState))
    item.fixPosDesc = item.isFixPos ? "固定位置" : "不固定位置"
}

function reviewParser(item) {
    caseParser.call(this, item)
    this.$set(item, 'showActionBtn', item.applyState === sysConfig.CHECK_NEW)
}

function applyParser(item) {
    caseParser.call(this, item)
    item.showDeleteBtn = item.applyState === sysConfig.CHECK_NEW
}

function parseItem(item) {
    var isSelf = gData.humanID == item.humanID
    caseParser.call(this, item)
    item.showDeleteBtn = isSelf
    if (!isSelf) {
        this.$set(item, 'showActionBtn', item.applyState === sysConfig.CHECK_NEW)
    }

    item.replyInfo = `${item.replyHumanName}${getReplyTime(item)}`

    if (item.cityName) {
        item.address = item.cityName
    } else {
        item.address = item.provinceName
    }
}


function getReplyTime(item) {
    try {
        if (item.applyState == sysConfig.CHECK_YES
            || item.applyState == sysConfig.CHECK_NO) {
            var date = dateUtil.parseDate(item.replyTime)
            return '   ' + dateUtil.formatDateByDate(date, dateUtil.FORMAT_YMDHM)
        }
    } catch (e) {
        console.log(e)
    }
    return ''
}
export {reviewParser, applyParser, parseItem}
