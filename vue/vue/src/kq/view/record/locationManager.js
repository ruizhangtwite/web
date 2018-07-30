import dateUtil from "DateUtil";
import http from "Http";
import {Indicator, Toast} from "mint-ui";

export const locationMethods = {
    onFilterChange(val) {
        if (val[0] == 0) {
            this.fetchData()
        } else {
            this.onDataChange()
        }
    },
    fetchData() {
        Indicator.open()
        http.ajax({
            functionName: `/mi/cluster/${this.isIdentifyMode ? 'getnotidentifypos' : 'getclusterpositionstat'}`,
            params: {
                humanID: this.humanID,
                status: this.selectedIndex[0] == 0 ? 2 : 1,//周1，月2
                clusterID: this.clusterID
            },
            success: (data) => {
                if (data && data.success && data.data) {
                    data = data.data
                    if (data && data.list) {
                        this.dataList = this.prepareData(data.list)
                        this.onDataChange()
                    }
                } else {
                    Toast("获取列表失败")
                }
            },
            finally: () => {
                Indicator.close()
            }
        })
    },
    prepareData(list) {
        list.map(item => {
            item.dateList = item.checkTimes && item.checkTimes.split(',').map(dateItem => {
                    let date = dateUtil.parseDate(dateItem)
                    let isMorning = date.getHours() < 12
                    return {
                        dateText: this.getDateText(isMorning, date),
                        date: date,
                        isMorning: isMorning
                    }
                }) || []
            item.checkIDList = item.checkIDs && item.checkIDs.split(',') || []
            item.remarkList = item.remarks && item.remarks.split(',') || []
        })
        return list
    },
    //当数据源改变或者过滤条件改变时调用此方法
    onDataChange() {
        let filterList = []
        let [, timeIndex, identifyIndex] = this.selectedIndex

        for (let i = 0; i < this.dataList.length; i++) {
            let item = this.dataList[i]
            if (identifyIndex == 1 && item.identifyFlag != 0
                || identifyIndex == 2 && item.identifyFlag == 0) {
                continue
            }
            let newItem = {...item}
            this.dealItem(newItem, timeIndex)

            if (newItem.dateList.length > 0) {
                filterList.push(newItem)
            }
        }

        if (this.onFilterEnd) {
            this.onFilterEnd(filterList)
        }
    },

    /**
     * 每个点会打卡多次，每次打卡都会对应一个checkID，这里根据选择的是上午还是下午
     * 进行过滤。另外，顺便统计打卡次数，方便展示。
     */
    dealItem(item, timeIndex) {
        let maxLen = Math.max(item.dateList.length, item.checkIDList.length)

        let newDateList = []
        let newCheckIDList = []
        for (let i = 0; i < maxLen; i++) {
            let dateItem = item.dateList[i]
            if (timeIndex == 1 && !dateItem.isMorning
                || timeIndex == 2 && dateItem.isMorning) {
                continue
            }
            newDateList.push(dateItem)
            newCheckIDList.push(item.checkIDList[i])
        }

        item.dateList = newDateList
        item.checkIDList = newCheckIDList
        item.checkCount = newDateList.length
    }
}

export const extraData = function () {
    return {
        dataList: []
    }
}

export function getCurrentProvinceAndCity(callback) {
    require('baiduMap')

    function requestCityAndProvince(provinceName, cityName) {
        http.ajax({
            functionName: `/common/provinceandcity/getproandcitybyname`,
            params: { province: provinceName, city: cityName },
            success: (data) => {
                if (data && data.success && data.data) {
                    data = data.data
                    if (callback) {
                        callback(data.province, data.city)
                    }
                }
            }
        })
    }

    new BMap.Geolocation().getCurrentPosition(function (r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
            if (r.address) {
                requestCityAndProvince(r.address.province, r.address.city)
            }
        }
    }, {enableHighAccuracy: true})
}