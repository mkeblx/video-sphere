'use strict';

var clock = new THREE.Clock();

var camera, scene, renderer;

var fullScreenButton;

var vrEffect;
var vrControls;

var objects = [];
var meshes = [];
var selectedObj, selId = 0;


var has = {
	WebVR: !!navigator.getVRDevices
};


window.addEventListener('load', load);

function load() {
	init();
	animate();
}


function init() {
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);

	fullScreenButton = document.querySelector('#vr-button');

	setupScene();
	setupLights();
	setupRendering();
	setupControls();
	setupEvents();
}


function setupScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0xffffff, 0, 1500);

	setupVideoSpheres();
}

function setupVideoSpheres() {
	var spheresGroup = new THREE.Group();

	spheresGroup.position.set(0,0,-100);

	var spheres = DATA;

	for (var i = 0; i < spheres.length; i++) {
		var videoSphere = new N.VideoSphere(spheres[i]);
		
		var c = videoSphere.getContainer();

		objects.push(videoSphere);
		meshes.push(c);

		c.position.fromArray(spheres[i].pos);

		spheresGroup.add(c);
	}

	scene.add(spheresGroup);

	selectedObj = objects[selId];
}

function setupLights() {
	var light = new THREE.AmbientLight(0x666666);
	scene.add(light);
}

function setupRendering() {
	renderer = new THREE.WebGLRenderer({
		antialias: false
	});
	renderer.setClearColor(0xffffff, 0);

	function VREffectLoaded(error) {
		if (error) {
			fullScreenButton.innerHTML = error;
			fullScreenButton.classList.add('error');
		}
	}

	renderer.setSize(window.innerWidth, window.innerHeight);
	vrEffect = new THREE.VREffect(renderer, VREffectLoaded);

	document.body.appendChild(renderer.domElement);
}

function setupControls() {
	vrControls = new THREE.VRControls(camera);
}

function setupEvents() {
	window.addEventListener('resize', onWindowResize, false);
	document.addEventListener('keydown', keyPressed, false);

	fullScreenButton.addEventListener('click', function(){
		vrEffect.setFullScreen(true);
	}, true);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}


function keyPressed(e) {
	switch (e.keyCode) {
		case 82: // R
			vrControls._vrInput.zeroSensor();
			break;
		case 70: // F
			vrEffect.setFullScreen(true);
			break;
		case 219: // [
			vrEffect.setRenderScale(vrEffect.getRenderScale()*1/1.1);
			break;
		case 221: // ]
			vrEffect.setRenderScale(vrEffect.getRenderScale()*1.1);
			break;

		case 9: // tab
			cycleSelection();
			e.preventDefault();
			break;
	}

	selectedObj.fire('kbd', e);
}

function cycleSelection() {
	selId++;
	if (selId > objects.length-1) selId = 0;
	selectedObj = objects[selId];
}

function handleSelection(pos, vrState) {
	var rotation = new THREE.Quaternion();
	rotation.fromArray(vrState.hmd.rotation);

	var dir = new THREE.Vector3(0,0,-1);
	dir = dir.applyQuaternion(rotation);

	var _pos = new THREE.Vector3();
	_pos = _pos.fromArray(pos);

	var ray = new THREE.Raycaster(_pos, dir);

	var intersects = ray.intersectObjects(meshes, true);
	if (intersects.length) {
		var io = intersects[0];

		if (io.object.parent.sphere) {
			var sph = io.object.parent.sphere;
			selectedObj = sph;
		}
	}
}

function animate(t) {
	requestAnimationFrame(animate);

	var dt = clock.getDelta();

	var vrState = vrControls.getVRState();

	var s = 500;

	if (vrState) {
		var vrPos = vrState.hmd.position;
		var pos = vrPos;
		pos[0] *= s;
		pos[1] *= s;
		pos[2] *= s;

		camera.position.fromArray(pos);

		handleSelection(pos, vrState);
	}

	vrControls.update();

	render(dt);
}

function render(dt) {
	vrEffect.render(scene, camera);
}
