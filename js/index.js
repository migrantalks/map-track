/**
* 轨迹距离
*/
var RoadDistance = {
    getRad: function(d) {
        return d * Math.PI / 180.0
    },
    getDistance: function(point1, point2) {

        var weidu1 = point1.lat;
        var jingdu1 = point1.lng;
        
        var weidu2 = point2.lat;
        var jingdu2 = point2.lng;

        var earth_radius = 6378137.0;
        var radWeidu1 = RoadDistance.getRad(weidu1);
        var radWeidu2 = RoadDistance.getRad(weidu2);
        var a = radWeidu1 - radWeidu2;
        var b = RoadDistance.getRad(jingdu1) - RoadDistance.getRad(jingdu2);
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2), 2) + Math.cos(radWeidu1) * Math.cos(radWeidu2) * Math.pow(Math.sin(b/2), 2)));
        s = s * earth_radius;
        s = Math.round(s * 10000) / 10000.0;
        return s
    }
}

/**
* 绘制轨迹箭头
*/
function drawArrow(polyline, length, angleValue) {
    var linePoint = polyline.getPath();//线的坐标串  
    var arrowCount = linePoint.length;  

    for(var i = 1; i < arrowCount; i++){ //在拐点处绘制箭头  

        var pixelStart = map.pointToPixel(linePoint[i-1]);  
        var pixelEnd = map.pointToPixel(linePoint[i]);  
        var angle = angleValue;//箭头和主线的夹角  
        var r = length; // r/Math.sin(angle)代表箭头长度  
        var delta = 0; //主线斜率，垂直时无斜率  
        var param = 0; //代码简洁考虑  
        var pixelTemX, pixelTemY;//临时点坐标  
        var pixelX, pixelY, pixelX1, pixelY1;//箭头两个点  

        if (pixelEnd.x - pixelStart.x == 0) { //斜率不存在时  
            pixelTemX = pixelEnd.x;  
            if (pixelEnd.y > pixelStart.y) {  
                pixelTemY = pixelEnd.y - r;  
            } else {  
                pixelTemY = pixelEnd.y + r;  
            }     
            //已知直角三角形两个点坐标及其中一个角，求另外一个点坐标算法  
            pixelX = pixelTemX - r * Math.tan(angle);   
            pixelX1 = pixelTemX + r * Math.tan(angle);  
            pixelY = pixelY1 = pixelTemY;  
        } else {  //斜率存在时 
            delta = (pixelEnd.y - pixelStart.y) / (pixelEnd.x - pixelStart.x);  
            param = Math.sqrt(delta*delta + 1);  
          
            if ((pixelEnd.x - pixelStart.x) < 0) {//第二、三象限  
            
                pixelTemX = pixelEnd.x + r / param;  
                pixelTemY = pixelEnd.y + delta * r / param;  
            } else {//第一、四象限  
            
                pixelTemX = pixelEnd.x - r / param;  
                pixelTemY = pixelEnd.y - delta * r / param;  
            }  
            //已知直角三角形两个点坐标及其中一个角，求另外一个点坐标算法  
            pixelX = pixelTemX + Math.tan(angle) * r * delta / param;  
            pixelY = pixelTemY - Math.tan(angle) * r / param;  
          
            pixelX1 = pixelTemX - Math.tan(angle) * r * delta / param;  
            pixelY1 = pixelTemY + Math.tan(angle) * r / param;  
        }  
          
        var pointArrow = map.pixelToPoint(new BMap.Pixel(pixelX, pixelY));  
        var pointArrow1 = map.pixelToPoint(new BMap.Pixel(pixelX1, pixelY1));  

        var Arrow = new BMap.Polyline([  
            pointArrow,  
            linePoint[i],  
            pointArrow1  
        ], {strokeColor: "red", strokeWeight: 3, strokeOpacity: 0.5});  

        map.addOverlay(Arrow);    
    }
}

/**
* 经纬度转换为百度坐标
*/
function gcjtobd09(gcj_lon, gcj_lat) {
 
    var gcj_lon = parseFloat(gcj_lon);
    var gcj_lat = parseFloat(gcj_lat);
    
    var x_PI = 3.141592653589793 * 3000.0 / 180.0;
    var x = gcj_lon;
    var y = gcj_lat;

    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_PI);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_PI);
    var bd_lon = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;

    var axis = {
        "lng": bd_lon.toFixed(6),
        "lat": bd_lat.toFixed(6)
    };
    return axis;
}

/**
* 更新轨迹显示范围
*/
function setZoom(bPoints){

    var view = map.getViewport(eval(bPoints));
    var mapZoom = view.zoom; 
    var centerPoint = view.center; 
    map.centerAndZoom(centerPoint,mapZoom);
}
 
/**
* 绘制轨迹
*/
function drawTrack() {

	var axis = $('#tarck_axis').val();//轨迹原始数据

	if (!axis.length) {
		alert('请输入坐标数据');
		return;
	}

    clearOverlays();

	var points = [];//所有轨迹点

	var axis_ary = axis.split(';');
    var axis_len = axis_ary.length;
    if (!axis_ary[axis_len - 1].length) {
        axis_len--;
    }

	for (var i = 0; i < axis_len; i++) {

		if (!axis_ary[i].length) break;

		var lng_lat = axis_ary[i].split(',');

	    var point = gcjtobd09(lng_lat[0], lng_lat[1]);
		points.push(new BMap.Point(point.lng, point.lat));
	}

	var polyline = new BMap.Polyline(points, {strokeColor:"red", strokeWeight: 3, strokeOpacity: 0.5});
	map.addOverlay(polyline);

    // 起始 结束点
    /*var start = new BMap.Point(points[0].lng, points[0].lat);

    var last_idx = points.length - 1;
    var end = new BMap.Point(points[last_idx].lng, points[last_idx].lat);
    driving.search(start, end);*/

    setTimeout(function() {
        drawArrow(polyline, 4, Math.PI / 7);
    }, 100);

    setTimeout(function() {
        setZoom(points);
    }, 100);
}

/**
* 清除地图原轨迹数据
*/
function clearOverlays() {
    var allOverlay = map.getOverlays();
    for (var i = 0; i < allOverlay.length -1; i++){
        map.removeOverlay(allOverlay[i]);
    }
}

/**
* 清除数据
*/
function clearTrack() {
    $('#tarck_axis').val('');
    clearOverlays();
}

/**
* 总里程
*/
function trackTotalDistance() {
    var axis = $('#tarck_axis').val();
    if (!axis.length) {
        alert('请输入坐标数据');
        return;
    }

    var total_distance = 0;//总距离
    var points = [];//所有轨迹点

    var axis_ary = axis.split(';');
    var axis_len = axis_ary.length;
    if (!axis_ary[axis_len - 1].length) {
        axis_len--;
    }
    for (var i = 0; i < axis_len; i++) {

        if (i == axis_len - 1) break;

        var lng_lat1 = axis_ary[i].split(',');
        var lng_lat2 = axis_ary[i + 1].split(',');

        var point1 = gcjtobd09(lng_lat1[0], lng_lat1[1]);
        var point2 = gcjtobd09(lng_lat2[0], lng_lat2[1]);

        total_distance += RoadDistance.getDistance(point1, point2);
    }

    $('#tarck_distance').html('此次运行轨迹总里程数：' + total_distance);
}

var map = new BMap.Map("tarck_map");
var point = new BMap.Point(116.331398, 39.897445);
map.centerAndZoom(point, 15);
map.enableScrollWheelZoom();

// 平移缩放控件
var opts = {type: BMAP_NAVIGATION_CONTROL_LARGE}    
map.addControl(new BMap.NavigationControl(opts));
// 比例尺 
var opts = {anchor: BMAP_ANCHOR_TOP_LEFT}
map.addControl(new BMap.ScaleControl(opts));    
// 缩略地图
map.addControl(new BMap.OverviewMapControl());    

var driving = new BMap.DrivingRoute(map, { 
    renderOptions: { 
        map: map, 
        autoViewport: true 
    }
});


