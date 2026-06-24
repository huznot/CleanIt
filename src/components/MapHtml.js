// Feather-style SVG icons embedded as strings (no emojis anywhere)
function depotSVG(sz) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>`
}
function recycleSVG(sz) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>`
}
function trashSVG(sz) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`
}

export const getMapHtml = () => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;overflow:hidden;background:#F3F8F4;font-family:-apple-system,system-ui,sans-serif}
    #map{width:100%;height:100%}
    .leaflet-popup-content-wrapper{border-radius:18px!important;box-shadow:0 8px 32px rgba(0,47,20,.13)!important;border:1.5px solid #DCE9DF!important;padding:0!important;overflow:hidden}
    .leaflet-popup-content{margin:0!important;width:268px!important}
    .leaflet-popup-tip-container{display:none!important}
    .leaflet-popup-close-button{color:#8FA898!important;font-size:22px!important;right:14px!important;top:14px!important;padding:0!important;line-height:1!important}
    .leaflet-control-zoom{border:none!important;box-shadow:0 2px 12px rgba(0,47,20,.12)!important;border-radius:12px!important;overflow:hidden}
    .leaflet-control-zoom a{color:#006B3C!important;font-weight:700!important;font-size:18px!important;width:36px!important;height:36px!important;line-height:36px!important}
    .leaflet-control-zoom a:hover{background:#E4F5EC!important}
    .mk{display:flex;align-items:center;justify-content:center;border-radius:50%;border:2.5px solid white}
    .mk-d{background:#003F8A;box-shadow:0 3px 12px rgba(0,63,138,.45)}
    .mk-r{background:#006B3C;box-shadow:0 2px 7px rgba(0,107,60,.38)}
    .mk-g{background:#8FA898;box-shadow:0 1px 5px rgba(0,0,0,.18)}
    .ph{padding:15px 18px 12px;border-bottom:1.5px solid #EEF5F0}
    .pt{font-size:10px;font-weight:700;letter-spacing:.9px;text-transform:uppercase;margin-bottom:5px}
    .td{color:#003F8A}.tr{color:#006B3C}.tg{color:#8FA898}
    .pn{font-size:15px;font-weight:700;color:#1A2E1C;line-height:1.35}
    .pb{padding:10px 18px 16px}
    .pr{display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;font-size:12.5px;color:#4A6350;line-height:1.45}
    .rl{font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#8FA898;white-space:nowrap;padding-top:2px;min-width:46px}
    .pbtn{display:block;background:linear-gradient(135deg,#006B3C,#004D2A);color:white;text-align:center;padding:11px;border-radius:11px;font-size:13px;font-weight:700;margin-top:12px;cursor:pointer;border:none;width:100%}
  </style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.js"></script>
<script>
var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([49.8951,-97.1384],12);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{subdomains:'abcd',maxZoom:19}).addTo(map);
L.control.zoom({position:'bottomright'}).addTo(map);

function dIcon(){return L.divIcon({className:'',html:'<div class="mk mk-d" style="width:46px;height:46px">${depotSVG(22)}</div>',iconSize:[46,46],iconAnchor:[23,23],popupAnchor:[0,-28]})}
function rIcon(){return L.divIcon({className:'',html:'<div class="mk mk-r" style="width:26px;height:26px">${recycleSVG(13)}</div>',iconSize:[26,26],iconAnchor:[13,13],popupAnchor:[0,-16]})}
function gIcon(){return L.divIcon({className:'',html:'<div class="mk mk-g" style="width:18px;height:18px">${trashSVG(9)}</div>',iconSize:[18,18],iconAnchor:[9,9],popupAnchor:[0,-12]})}

function depotPop(d){
  return '<div class="ph"><div class="pt td">Recycling Depot</div><div class="pn">'+d.name+'</div></div><div class="pb"><div class="pr"><span class="rl">Hours</span>'+d.hours+'</div><div class="pr"><span class="rl">Phone</span>'+d.phone+'</div><div class="pr"><span class="rl">Accepts</span>'+d.accepts+'</div><button class="pbtn">Get Directions</button></div>';
}
function rcPop(n){
  return '<div class="ph"><div class="pt tr">Recycling Bin</div><div class="pn">'+n+'</div></div><div class="pb"><div class="pr"><span class="rl">Accepts</span>Plastics, Paper, Glass, Metal</div><div class="pr"><span class="rl">Access</span>24 / 7</div><button class="pbtn">Get Directions</button></div>';
}
function gbPop(n){
  return '<div class="ph"><div class="pt tg">General Waste</div><div class="pn">'+n+'</div></div><div class="pb"><div class="pr"><span class="rl">Type</span>General household waste only</div><div class="pr"><span class="rl">Access</span>24 / 7</div></div>';
}

var depots=[
  {lat:49.7985,lng:-97.1234,name:"Brady Road Resource Recovery Park",hours:"Mon-Sat  8 AM - 5 PM",phone:"204-986-2760",accepts:"Recyclables, Electronics, Metals, Organics"},
  {lat:49.9192,lng:-97.1447,name:"North End Drop-Off Depot",hours:"Tue-Sat  9 AM - 4 PM",phone:"204-986-4567",accepts:"Paper, Cardboard, Plastics, Glass"},
  {lat:49.8234,lng:-97.1567,name:"South Winnipeg Eco Station",hours:"Mon-Fri  8 AM - 6 PM",phone:"204-986-7890",accepts:"Hazardous Waste, Electronics, Recyclables"},
  {lat:49.8912,lng:-97.2213,name:"West Winnipeg Recycling Centre",hours:"Mon-Sat  7 AM - 7 PM",phone:"204-986-1234",accepts:"All Materials Accepted"},
  {lat:49.8756,lng:-97.0678,name:"Henderson Highway Depot",hours:"Mon-Sat  9 AM - 5 PM",phone:"204-986-3456",accepts:"Cardboard, Paper, Plastics"},
];
depots.forEach(function(d){L.marker([d.lat,d.lng],{icon:dIcon()}).bindPopup(depotPop(d),{maxWidth:290}).addTo(map);});

// LCG pseudo-random (fixed seed for reproducible layout)
var _s=54321;
function rnd(){_s=((_s*1664525+1013904223)>>>0);return _s/4294967296}
function rLat(){return 49.810+rnd()*0.140}
function rLng(){return -97.278+rnd()*0.255}

var streets=["Portage","Main","Pembina","Henderson","McPhillips","Corydon","St. Mary","Notre Dame","Grant","Ness","Salter","Burrows","Selkirk","River","Kenaston","Taylor","Waverly","Gateway","Sargent","Arlington","Ellice","Maryland","Osborne","Academy","Wellington","Flora","Logan","Dufferin","King Edward","Jefferson","Lagimodiere","St. Anne","Regent","Springfield","Concordia","Fermor","Roblin","Moray","Sterling Lyon","Bishop Grandin","Leila","McAdam","Inkster","Mountain","Jefferson","Kildonan","Raleigh","Redwood","Atlantic","Pacific","College"];
var rT=["Recycling Station","Recycling Point","Blue Bin","Community Recycling","Eco Station","Recycling Hub","Green Point","Bottle Depot","Blue Box Station"];
var gT=["Waste Station","General Waste","Disposal Point","Waste Bin","Collection Point","Landfill Drop"];

for(var i=0;i<100;i++){
  var n=streets[i%streets.length]+' '+rT[i%rT.length];
  L.marker([rLat(),rLng()],{icon:rIcon()}).bindPopup(rcPop(n),{maxWidth:270}).addTo(map);
}
for(var j=0;j<55;j++){
  var n2=streets[(j+13)%streets.length]+' '+gT[j%gT.length];
  L.marker([rLat(),rLng()],{icon:gIcon()}).bindPopup(gbPop(n2),{maxWidth:260}).addTo(map);
}

// User location — called from React Native via injectJavaScript
var _uDot=null,_uRing=null,_uLatLng=null;
function showUser(lat,lng){
  _uLatLng=[lat,lng];
  if(_uDot){map.removeLayer(_uDot);}
  if(_uRing){map.removeLayer(_uRing);}
  _uRing=L.circleMarker([lat,lng],{radius:18,fillColor:'#4A90D9',fillOpacity:0.14,color:'#4A90D9',weight:1.5,opacity:0.35}).addTo(map);
  _uDot=L.circleMarker([lat,lng],{radius:8,fillColor:'#4A90D9',fillOpacity:1,color:'white',weight:3}).addTo(map);
  _uDot.bindTooltip('<b style="font-family:-apple-system,sans-serif;font-size:11px;color:#1A2E1C">You are here</b>',{permanent:false,offset:[0,-10]});
  map.flyTo([lat,lng],15,{animate:true,duration:0.9});
}
window.setUserLocation=function(lat,lng){
  showUser(lat,lng);
};
window.locateUser=function(){
  if(_uLatLng){map.flyTo(_uLatLng,15,{animate:true,duration:0.9});}
};

window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'ready'}));
</script>
</body>
</html>
`
