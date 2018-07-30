import {Toast} from 'mint-ui';
import {Indicator} from 'mint-ui';
import {data as gData} from 'zhixin';
import http from 'Http';
module.exports = {
    deleteConcern(id, success, fail) {
        Indicator.open();
        http.ajax({
            functionName: "home/genericservice/human/deleteconcern",
            params: {
                id: id,
            },
            success: data=> {
                if (data && data.success) {
                    Toast("取消关注成功");
                    if (success) {
                        success();
                    }
                } else {
                    Toast("取消关注失败");
                    if (fail) {
                        fail();
                    }
                }
            },
            finally: () => {
                Indicator.close();
            }
        });
    },
    addConcern(objId, type, success, fail) {
        Indicator.open();
        http.ajax({
            functionName: "home/genericservice/human/addconcern",
            params: {
                humanID: gData.humanID,
                concernTypeID: type,
                concernObjID: objId
            },
            success: function (data) {
                if (data && data.success) {
                    Toast("关注成功");

                    if (data.data && data.data.concern && success) {
                        success(data.data.concern.id);
                    }
                } else {
                    Toast("关注失败");
                    if (fail) {
                        fail();
                    }
                }
            },
            finally: () => {
                Indicator.close();
            }
        });
    }
};