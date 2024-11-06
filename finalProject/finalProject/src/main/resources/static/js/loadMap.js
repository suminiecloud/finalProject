var mapContainer = document.getElementById('map'), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(37.4388938204128, 126.675113024566), // 지도의 중심좌표(인천일보아카데미)
    level: 3 // 지도의 확대 레벨
  };
var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

function searchPoi() {
  var latlng = map.getCenter();
  const x = latlng.getLng();
  console.log(x);
  const y = latlng.getLat();
  console.log(y);
  let inputKeywordVal = document.getElementById('inputKeyword').value;
  loadingOn();
  $.ajax({
    url: '/travelMap/poi',
    data: {
      x: x,
      y: y,
      keyword: inputKeywordVal
    },
    success: function(result) {
      if (result.code != 'SUCC') {
        alert("검색에 실패 하였습니다.");
        return;
      }
      const data = result.data;
      displayData(data);
      loadingOff()
    },
    error: function() {
      alert("검색에 실패 하였습니다.");
      loadingOff()
    }
  });
}

function displayData(data) {

  const nodeList = data.nodeList; // // 방문지목록
  const totalDistance = data.totalDistance;// 전체이동거리(미터)
  const totalDuration = data.totalDuration;// 전체이동시간(초)
  const totalPathPointList = data.totalPathPointList;// // 전체이동경로
  var bounds = new kakao.maps.LatLngBounds();
  const nodeList_parent = document.getElementById('nodeList');
  nodeList_parent.innerHTML = ``;
  let nodeList_div = document.createElement('div');
  nodeList_div.classList.add('list-group');

  for (let node of nodeList) {
    let listItem_div = document.createElement('div');
    listItem_div.classList.add('list-group-item', 'list-group-item-action');
    listItem_div.innerHTML = `
                 <div class="mt-3 small">
                     <div class="d-flex w-100 align-items-center justify-content-start mb-1">
                         <strong class="ms-1">${node.name}</strong>
                     </div>
                  <div class="d-flex align-items-center justify-content-between">
                       <div class="d-flex align-items-center"><span class="badge text-bg-light border border-secondary-subtle me-2">주소</span> <span>${node.address}</span></div>
                       <div class="d-flex align-items-center"><span class="badge text-bg-light border border-secondary-subtle me-2">전화</span> <span>${node.phone}</span></div>
                  </div>
                 </div>
                 `;
    nodeList_div.appendChild(listItem_div);
    listItem_div.addEventListener('click', function() {
      selectPlace(node, bounds);
    })
    const position = new kakao.maps.LatLng(node.y, node.x);
    bounds.extend(position);
  }
  nodeList_parent.appendChild(nodeList_div);
  if (nodeList.length > 0) {
    map.setBounds(bounds);
  }
}

function selectPlace(node, bounds) {
  console.log(node);
  let x = node.x;
  let y = node.y;
  console.log(x, y);
  // 마커 등록 기능 호출
  addMarker(node)
  // 플랜 추가 기능 호출
  addPlan(node);
}

const NODE_MAP = {};
const MARKER_MAP = {};
const INFO_MAP = {};
let MARKERS = {};
let INFOWINDOWS = {};

function addMarker(node) {
  if (document.getElementById(node.id) != null) {
    return;
  }
  const position = new kakao.maps.LatLng(node.y, node.x);
  // 배열의 좌표들이 잘 보이게 마커를 지도에 추가합니다
  const marker = new kakao.maps.Marker({ position: position, clickable: true });
  console.log('marker');
  console.log(marker);

  marker.setMap(map);
  marker.id = node.id
  let markerByDate = MARKERS[selDateList]
  if (markerByDate == undefined) {
    markerByDate = [];
  }
  markerByDate.push(marker);
  MARKERS[selDateList] = markerByDate;

  const name = node.name;
  const phone = node.phone;
  // 인포윈도우를 생성합니다
  const infowindow = new kakao.maps.InfoWindow({
    content: '<div style="padding:5px;">' + name + '<br/>' + phone + '</div>',
    removable: true
  });
  infowindow.id = node.id;
  let infowindowByDate = INFOWINDOWS[selDateList];
  if(infowindowByDate == undefined){
    
  }

  MARKER_MAP[node.id] = marker;
  INFO_MAP[node.id] = infowindow;
  // 마커에 클릭이벤트를 등록합니다
  kakao.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);
  });
}

function addPlan(node) {
  if (document.getElementById(node.id) != null) {
    return;
  }
  NODE_MAP[node.id] = node;
  const selectPlan = document.getElementById('selPlanListByDate');
  let planItem = document.createElement('div');
  planItem.classList.add('list-group-item', 'list-group-item-action');
  planItem.innerHTML = `<div id="${node.id}" onclick="deletePlace(${node.id},this)" >${node.name}</div>`;
  selectPlan.appendChild(planItem);

  var moveLatLon = new kakao.maps.LatLng(node.y, node.x);
  map.panTo(moveLatLon);

  selectPlaceAdd(node);
}

function deletePlace(nodeId, deleteEl) {
  deleteEl.parentElement.remove();
  let index = -1;
  let i = 0;
  let deleteMarker = null;
  for (let marker of MARKERS[selDateList]) {
    //console.log(plan.id);
    if (marker.id == nodeId) {
      index = i;
      deleteMarker = marker;
      break;
    }
    i++;
  }
  deleteMarker.setMap(null);
  MARKERS[selDateList].splice(index, 1);

  let pIndex = -1;
  let j = 0;
  for (let plan of planList[selDateList]) {
    //console.log(plan.id);
    if (plan.id == nodeId) {
      pIndex = j;
      break;
    }
    j++;
  }
  planList[selDateList].splice(pIndex, 1);

  if (POLYLINE) {
    POLYLINE.setMap(null);
    POLYLINE = null;
  }
}

function DeleteMarker(nodeId, selObj) {
  console.log('DeleteMarker')
  console.log(nodeId);
  let index = -1;
  let i = 0;
  for (let plan of planList[selDateList]) {
    //console.log(plan.id);
    if (plan.id == nodeId) {
      index = i
      break;
    }
    i++;
  }
  console.log('index');
  console.log(index);
  planList[selDateList].splice(index, 1);

  MARKER_MAP[nodeId].setMap(null);
  MARKER_MAP[nodeId] = null;
  INFO_MAP[nodeId].close();
  INFO_MAP[nodeId] = null;
  delete MARKER_MAP[nodeId];
  delete INFO_MAP[nodeId];
  delete NODE_MAP[nodeId];
  selObj.parentElement.remove();
  if (POLYLINE) {
    POLYLINE.setMap(null);
    POLYLINE = null;
  }
}

function loadingOn() {
  document.getElementById('spin').style.display = 'flex';
}
function loadingOff() {
  document.getElementById('spin').style.display = 'none';
}

function goVrp() {
  loadingOn();
  console.log(JSON.stringify(Object.values(NODE_MAP)));
  $.ajax({
    url: '/travelMap/vrp',
    type: 'post',
    contentType: "application/json",
    data: JSON.stringify(Object.values(NODE_MAP)),
    success: function(result) {
      if (result.code != 'SUCC') {
        alert("경로 최적화에 실패 하였습니다.");
        loadingOff();
        return;
      }
      const data = result.data;
      drawPath(data.totalPathPointList);
      console.log(data);
      const selectNode = document.getElementById('selectNode');
      selectNode.innerHTML = ``;
      for (let node of data.nodeList) {
        addPlan(node);
      }
      loadingOff();
    },
    error: function() {
      alert("경로 최적화에 실패 하였습니다.");
      loadingOff();
    }
  });
}
var POLYLINE = null;
function drawPath(nodeList) {

  if (nodeList.length > 0) {
    // 선을 구성하는 좌표 배열입니다. 이 좌표들을 이어서 선을 표시합니다
    var linePath = [];
    for (var point of nodeList) {
      linePath.push(new kakao.maps.LatLng(point.y, point.x));
      console.log("좌표배열" + linePath.push(new kakao.maps.LatLng(point.y, point.x)));
    }

    // 지도에 표시할 선을 생성합니다
    POLYLINE = new kakao.maps.Polyline({
      path: linePath, // 선을 구성하는 좌표배열 입니다
      strokeWeight: 5, // 선의 두께 입니다
      strokeColor: "red", // 선의 색깔입니다
      strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
      strokeStyle: "solid", // 선의 스타일입니다
    });
    // 지도에 선을 표시합니다
    POLYLINE.setMap(map);

    // vrpComplete(linePath);
  }
}

/* function vrpComplete(linePath) {
  console.log(linePath);
  console.log(JSON.stringify(linePath));
  let lineObj = [];
  for (let line of linePath) {
    console.log(line.getLat(), line.getLng())
    let pointObj = { y: line.getLat(), x: line.getLng() };
    lineObj.push(pointObj)
  }
  $.ajax({
    url: '/travelMap/pathPoint',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify(lineObj),
    success: function(res) {
      console.log(res);
    }
  })
} */

/* let planList = {
  '2024-09-11': [node1],
  '2024-09-12': [node1, node2, node3],
  '2024-09-13': [node1, node3, node4]
}; */

//planList[] = NODE_MAP;

let selDateList = null;
let planList = {};

function selDate(date) {
  // 현재 보여지는 날짜가 아닌 다른 날짜를 클릭했을 때 map에서 marker 삭제
  let deleteMarkerList = MARKERS[selDateList];
  if (deleteMarkerList != undefined) {
    for (let delMarker of deleteMarkerList) {
      delMarker.setMap(null);
    }
  }

  // 현재 보여지는 날짜가 아닌 다른 날짜를 클릭했을 때 map에서 marker 추가
  let addMarkerList = MARKERS[date];
  if (addMarkerList != undefined) {
    for (let addMarker of addMarkerList) {
      addMarker.setMap(map);
    }
  }

  selDateList = date;
  let inputKeyword = document.getElementById('keywordView');
  inputKeyword.innerHTML =
    `<input type="text" class="form-control" id="inputKeyword" placeholder="검색어">
         <button class="btn btn-outline-secondary" type="button" onclick="searchPoi()">검색</button>`;
  let nodeList = document.getElementById('nodeList');
  nodeList.innerHTML =
    `<div class="list-group">
                  <a href="#" class="list-group-item list-group-item-action">
                    지역을 검색해주세요!
                  </a>
                </div>`;

  // 선택한 날짜의 일정(node)이 보여지도록
  document.getElementById('selPlanDate').innerHTML = date;  // 선택한 날짜가 담기는 div
  if (document.getElementById(date) != null) {
    return;
  }

  // 현재 보여지는 날짜가 아닌 다른 날짜를 클릭하면 보여졌던 날짜가 안보이도록
  let inOutDate = document.getElementById('selPlanListByDate');  // 선택한 날짜에 담기는 선택한 일정 목록 div
  inOutDate.innerHTML = ``;

  let planListByDate = planList[date];
  console.log(planListByDate);

  if (planListByDate != undefined) {
    for (let plan of planListByDate) {
      let dateList = document.createElement('div');
      dateList.classList.add('list-group-item', 'list-group-item-action');
      dateList.innerHTML = `
                    <div id="${plan.id}" onclick="deletePlace(${plan.id},this)" >${plan.name}</div>
                    `;
      inOutDate.appendChild(dateList);
    }
  }
}

function selectPlaceAdd(node) {
  if (selDateList == null) {
    return;
  }
  let checkPlan = planList[selDateList];
  if (checkPlan == undefined) {
    planList[selDateList] = [];
  }
  planList[selDateList].push(node);
  console.log(planList[selDateList]);

  // 경로 최적화  
  let selectPath = document.getElementById('selectPath');
  selectPath.innerHTML = ``;
  if (planList[selDateList] != null) {
    let vrpDiv = document.createElement('div');
    vrpDiv.innerHTML = `<button type="button" class="btn btn-dark w-100" onclick="goVrp()">경로 최적화</button>`;
    selectPath.appendChild(vrpDiv);
  }
}

/*function DeleteObj(nodeid,selObj) {
  selObj.parentElement.remove();
}*/




// let testPlaceList = {};

/*
    { '2024-09-11' : [ { id: 1111, address :'인천', x:33.333,y:123.333   }, 
                       { id: 2222, address :'서울', x:33.333,y:123.333   },
                       { id: 3333, address :'부천', x:33.333,y:123.333   }   ], 
      '2024-09-12' : [ { id: 1234, address :'서울', x:33.333,y:123.333   },
                       { id: 5678, address :'서울', x:33.333,y:123.333   }   ],
    }

    let planObj = testPlaceList['2024-09-12']

    
let a = { name:'이나연', email : 'lny@naver.com', gender : '여'  }  
let aValues = Object.values(a) //  [ '이나연', 'lny@naver.com', '여' ]
*/



























