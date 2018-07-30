import Util from 'Util'

export const filterData = [['全部', '自己的', '他人的'], ['全部', '待审批', '已通过', '未通过']]

export function getSelfFlag(index) {
    switch (index) {
        case 0:
            return -1 //全部
        case 1:
            return 1 //自己
        case 2:
            return 0 //他人
        default:
            return -1
    }
}

export function getApplyStat(index) {
    switch (index) {
        case 0:
            return -1//全部
        case 1:
            return 0 //待审批
        case 2:
            return 1 //已通过
        case 3:
            return 2 //未通过
        default:
            return 0
    }
}

export const locationData = [['近1月', '近1周'], ['全部', '上班', '下班'], ['全部', '未认证', '已认证']]

export function getContentStyle(offset) {
    var gF = Util.select('.groupFilter')
    var gFHeight = 112;

    if (gF && gF.length > 0) {
        gFHeight = gF[0].offsetHeight
    }

    offset = offset || 0
    return {
        top: Util.getHeaderHeight() + gFHeight + offset + 'px'
    }
}