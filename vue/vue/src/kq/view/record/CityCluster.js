import BubbleOverlay from './mapUtil'

export default function MarkerCluster(map, options) {
    this._map = map;
    var opts = options || {};
    this._markers = opts['items'] || [];
    this._clusters = [];
    this._gridSize = opts["gridSize"] || 60;
    this._maxZoom = opts["maxZoom"] || 10;
    this.onClusterClick = opts['onClusterClick'];
    this._zoomListener = () => {
        this._redraw();
    }
    this._moveListener = () => {
        this._redraw();
    }

    this._map.addEventListener("zoomend", this._zoomListener);

    this._map.addEventListener("moveend", this._moveListener);

    isArray(this._markers) && this._createClusters();
}


MarkerCluster.prototype._redraw = function () {
    this._clearLastClusters();
    this._createClusters();
};

MarkerCluster.prototype.destroy = function () {
    this._clearLastClusters();
    this._map.removeEventListener("zoomend", this._zoomListener);
    this._map.removeEventListener("moveend", this._moveListener);
};

MarkerCluster.prototype.getMaxZoom = function () {
    return this._maxZoom;
};


MarkerCluster.prototype._clearLastClusters = function () {
    for (var i = 0, cluster; cluster = this._clusters[i]; i++) {
        cluster.remove();
    }
    this._clusters = [];//置空Cluster数组
    this._removeMarkersFromCluster();//把Marker的cluster标记设为false
};

MarkerCluster.prototype._removeMarkersFromCluster = function () {
    for (var i = 0, marker; marker = this._markers[i]; i++) {
        marker.isInCluster = false;
    }
};

MarkerCluster.prototype._createClusters = function () {
    var mapBounds = this._map.getBounds();
    var extendedBounds = null;
    if (mapBounds.getNorthEast()) {
        extendedBounds = getExtendedBounds(this._map, mapBounds, this._gridSize);
    }
    for (var i = 0, marker; marker = this._markers[i]; i++) {
        if (!marker.isInCluster &&
            (extendedBounds == null || extendedBounds.containsPoint(marker.marker.getPosition()))) {
            this._addToClosestCluster(marker);
        }
    }
};

MarkerCluster.prototype._addToClosestCluster = function (marker) {
    var clusterToAddTo = null;
    for (var i = 0, cluster; cluster = this._clusters[i]; i++) {
        if (cluster.isSameCity(marker)) {
            clusterToAddTo = cluster;
        }
    }

    if (clusterToAddTo) {
        clusterToAddTo.addMarker(marker);
    } else {
        cluster = new Cluster(this, marker.cityCode, marker.cityName);
        cluster.addMarker(marker);
        this._clusters.push(cluster);
    }
};

function Cluster(markerCluster, cityCode, cityName) {
    this._markerCluster = markerCluster;
    this._map = markerCluster._map;
    this._center = null;//落脚位置
    this._markers = [];//这个Cluster中所包含的markers
    this._cityCode = cityCode;
    this._cityName = cityName;
    this._totalCount = 0;//addMarker时会更新
    this._identifyCount = 0;
    this._unIdentifyCount = 0;

    this._clusterMarker = new BubbleOverlay(this._center, {
            isCluster: true,
            callback: () => {
                this._markerCluster.onClusterClick(this)
            }
        }
    );
}

Cluster.prototype.isSameCity = function (marker) {
    return this._cityCode == marker.cityCode;
}

Cluster.prototype.addMarker = function (marker) {
    if (this.isMarkerInCluster(marker)) {
        return false;
    }//也可用marker.isInCluster判断,外面判断OK，这里基本不会命中

    if (!this._center) {
        this._center = marker.marker.getPosition();
    } else {
        var l = this._markers.length + 1;
        var lat = (this._center.lat * (l - 1) + marker.lat) / l;
        var lng = (this._center.lng * (l - 1) + marker.lng) / l;
        this._center = new BMap.Point(lng, lat);
    }

    this._clusterMarker.setPosition(this._center);

    this._totalCount += marker.num;

    if (marker.rawItem.identifyFlag > 0) {
        this._identifyCount += marker.num;
    } else {
        this._unIdentifyCount += marker.num;
    }

    this._clusterMarker.setIsIdentity(this._unIdentifyCount == 0);

    this._clusterMarker.setText(`${this._cityName}(${this._totalCount})`);

    marker.isInCluster = true;
    this._markers.push(marker);

    var len = this._markers.length;
    // if (len < this._minClusterSize) {
    //     // this._map.addOverlay(marker);
    //     return true;
    // } else if (len === this._minClusterSize) {
    for (var i = 0; i < len; i++) {
        var localMarker = this._markers[i].marker;
        this._map.removeOverlay(localMarker);
    }

    // }
    this._map.addOverlay(this._clusterMarker);
    this.updateClusterMarker();
    return true;
};

Cluster.prototype.updateClusterMarker = function () {
    if (this._map.getZoom() > this._markerCluster.getMaxZoom()) {
        this._clusterMarker && this._map.removeOverlay(this._clusterMarker);
        for (var i = 0, marker; marker = this._markers[i]; i++) {
            this._map.addOverlay(marker.marker);
        }
        return;
    }

    // if (this._markers.length < this._minClusterSize) {
    //     this._clusterMarker.hide();
    //     return;
    // }


    // this._clusterMarker.setText(this._markers.length);

    //TODO add click listener
    // var thatMap = this._map;
    // var thatBounds = this.getBounds();
    // this._clusterMarker.addEventListener("click", function(event){
    //     thatMap.setViewport(thatBounds);
    // });

};

Cluster.prototype.isMarkerInCluster = function (marker) {
    if (this._markers.indexOf) {
        return this._markers.indexOf(marker) != -1;
    } else {
        for (var i = 0, m; m = this._markers[i]; i++) {
            if (m === marker) {
                return true;
            }
        }
    }
    return false;
};

Cluster.prototype.remove = function () {
    for (var i = 0, m; m = this._markers[i]; i++) {
        this._map.removeOverlay(this._markers[i]);
    }//清除散的标记点
    this._map.removeOverlay(this._clusterMarker);
    this._markers.length = 0;
    delete this._markers;
}

var isArray = function (source) {
    return '[object Array]' === Object.prototype.toString.call(source);
};

var getExtendedBounds = function (map, bounds, gridSize) {
    bounds = cutBoundsInRange(bounds);
    var pixelNE = map.pointToPixel(bounds.getNorthEast());
    var pixelSW = map.pointToPixel(bounds.getSouthWest());
    pixelNE.x += gridSize;
    pixelNE.y -= gridSize;
    pixelSW.x -= gridSize;
    pixelSW.y += gridSize;
    var newNE = map.pixelToPoint(pixelNE);
    var newSW = map.pixelToPoint(pixelSW);
    return new BMap.Bounds(newSW, newNE);
};

var cutBoundsInRange = function (bounds) {
    var maxX = getRange(bounds.getNorthEast().lng, -180, 180);
    var minX = getRange(bounds.getSouthWest().lng, -180, 180);
    var maxY = getRange(bounds.getNorthEast().lat, -74, 74);
    var minY = getRange(bounds.getSouthWest().lat, -74, 74);
    return new BMap.Bounds(new BMap.Point(minX, minY), new BMap.Point(maxX, maxY));
};

var getRange = function (i, mix, max) {
    mix && (i = Math.max(i, mix));
    max && (i = Math.min(i, max));
    return i;
};
