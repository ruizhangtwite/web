require('baiduMap')

function BubbleOverlay(point, content) {
    this._point = point;
    this.content = content;
}

BubbleOverlay.prototype = new BMap.Overlay();

BubbleOverlay.prototype.setIsIdentity = function(isIdentify) {
    this.content.isIdentify = isIdentify
}

BubbleOverlay.prototype.setText = function (text) {
    this.content = this.content || {};
    this.content.text = text;

    if (this.textNode) {
        this.textNode.innerText = text;
    }
}

BubbleOverlay.prototype.setPosition = function (point) {
    this._point = point;
}

BubbleOverlay.prototype.getPosition = function (point) {
    return this._point;
}


BubbleOverlay.prototype.initialize = function (map) {
    this._map = map;
    var div = this._div = createBubble.call(this, this.content);
    map.getPanes().labelPane.appendChild(div);
    return div;
}

function createBubble({text, callback, isIdentify}) {
    var bubbleBox = document.createElement("div");
    addClass(bubbleBox, 'bubbleBox flex center-child vertical')

    var bubble = document.createElement("div");
    addClass(bubble, 'bubble flex center-content row');
    if (!isIdentify) {
        addClass(bubble, 'exception');
    }

    var iconLocation =  document.createElement("i");
    addClass(iconLocation, 'location');

    bubbleBox.appendChild(bubble);

    var textNode = document.createElement("div");
    addClass(textNode, 'col-center');

    textNode.appendChild(document.createTextNode(text));

    bubble.appendChild(textNode);
    this.textNode = textNode;

    if (callback) {
        (function () {
            var startX, startY;
            var lastEvent;
            bubble.addEventListener('touchstart', (event) => {
                var e = event.touches[0];
                startX = e.pageX;
                startY = e.pageY;
                lastEvent = event;
            });

            bubble.addEventListener('touchmove', (event) => {
                lastEvent = event;
            });

            bubble.addEventListener("touchend", (event) => {
                var e = lastEvent && lastEvent.touches[0];
                if (e) {
                    var x = e.pageX;
                    var y = e.pageY;
                    if (Math.pow(startX - x, 2) + Math.pow(startY - y, 2) < 64) {
                        callback();
                    }
                } else {
                    //more is better than less
                    callback();
                }
            });
        })();
    }
    return bubbleBox;
}

function addClass(obj, cls) {
    obj.className += " " + cls;
}

BubbleOverlay.prototype.draw = function () {
    var map = this._map;
    var pixel = map.pointToOverlayPixel(this._point);
    this._div.style.left = (pixel.x - this._div.offsetWidth / 2) + "px";

    this._div.style.top = pixel.y - this._div.offsetHeight + "px";
}

export default BubbleOverlay;

