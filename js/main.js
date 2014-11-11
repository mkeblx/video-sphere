'use strict';

var clock = new THREE.Clock();

var camera, scene, renderer;

var fullScreenButton;

var vrEffect;
var vrControls;

var objects = [];
var selectedObj;


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
	var spheres = [
		{
			video: {
				src: 'videos/reef_1920_4.webm',
				width: 640,
				height: 360,
				size: 500
			}
		}
	];

	for (var i = 0; i < spheres.length; i++) {
		var videoSphere = new N.VideoSphere(spheres[0]);
		
		objects.push(videoSphere);
		scene.add(videoSphere.getContainer());
	}

	selectedObj = objects[0];
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
	}

	selectedObj.fire('kbd', e);
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
	}

	vrControls.update();

	render(dt);
}

function render(dt) {
	vrEffect.render(scene, camera);
}
