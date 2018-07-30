/**
 * ACCESS_TOKEN：
 * https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=&secret=
 * TICKET:
 * https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=&type=jsapi
 */
import sha1 from 'sha1'

const ACCESSS_TOKEN = "CNMGwM7nGHYA_9HsZet1gHJoEC4Xj76rtWgrMWNpH9uWdJj3-V6MYA3F7tjWl5Eu4PR9Nu9fCeXoLtayNXafX0zwNC1_miGJGOxYt8e06xIXGOaAFANWE"
const TICKET = "bxLdikRXVbTPdHSM05e5uzYXgiGzbNNZcdQ7ytjWMnQ2903huRril51OnrAeNo7Yq07gz_vhrEO6UeP5sR3CHQ"
const NONCE_STR = "Wm3WZYTPz0wzccnW"

require('../libs/jweixin-1.2.0')

function getConfig() {
    let timestamp = Math.floor(new Date().getTime() / 1000)
    let url = window.location.href
    let str1 = `jsapi_ticket=${TICKET}&noncestr=${NONCE_STR}&timestamp=${timestamp}&url=${url}`
    let str2 = sha1(str1)
    console.log("str1 = " + str1)
    console.log("sha1 of str1 = " + str2)
    return {
        timestamp: timestamp,
        nonceStr: NONCE_STR,
        signature: str2
    }
}

function doConfig(apiList) {
    let config = getConfig()
    let obj = {
        debug: false,
        appId: 'wx6eb0450c307fab33',
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: [
            'checkJsApi',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
        ]
    }
    if (apiList) {
        obj.jsApiList = apiList
    }
    wx.config(obj)
}
export {
    getConfig,
    doConfig
}

