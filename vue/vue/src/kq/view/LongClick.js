const Vue = require('vue');

var isTouchConsumed = false;

Vue.directive('longclick', {
    bind: function (el, binding) {
        var startTime;
        var isLongClick;
        var isTouchFinish;
        var timeoutId;

        el.value = binding.value

        if (el.hasBind) {
            return
        }

        el.hasBind = true

        el.addEventListener('touchstart', function (e) {
            startTime = new Date()
            isLongClick = false
            isTouchFinish = false
            isTouchConsumed = false
            timeoutId = setTimeout(function () {
                if (!isTouchFinish && !isTouchConsumed) {
                    isLongClick = true
                    if (el.value && el.value.longClick) {
                        el.value.longClick()
                    }
                }
            }, 600)
        }, false);

        //TODO  判断手指没有移出点击区域
        el.addEventListener('touchend', function (e) {
            isTouchFinish = true
            clearTimeout(timeoutId)
            if (!isLongClick && !isTouchConsumed) {
                if (el.value && el.value.click) {
                    el.value.click()
                }
            }
        }, false);
    },
    //如果没有更新只是插入并不会调用update，所以把绑定clickListener放在bind中
    update: function (el, binding) {
        el.value = binding.value
    }
})

Vue.directive('scrollforclick', {
    bind: function (el, binding) {
        if (el.hasBind) {
            return
        }

        el.hasBind = true

        el.addEventListener('scroll', function () {
            isTouchConsumed = true
        });
    },
})

