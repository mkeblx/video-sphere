'use strict';

var clock = new THREE.Clock();

var camera, scene, renderer;

var fullScreenButton;

var vrEffect;
var vrControls;

var objects = [];


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

	// floor
	var geometry = new THREE.PlaneGeometry(2000, 2000, 1, 1);
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	var texture = THREE.ImageUtils.loadTexture('textures/checker.png');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;

	texture.repeat = new THREE.Vector2(20, 20);

	var material = new THREE.MeshBasicMaterial( { color: 0xcccccc, map: texture } );

	var mesh = new THREE.Mesh(geometry, material);
	mesh.receiveShadow = true;

	//scene.add(mesh);

	setupVideo();
}

function setupVideo() {

	var geo = new THREE.SphereGeometry( 500, 60, 40 );
	geo.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

	var video = document.createElement('video');
	video.width = 640;
	video.height = 360;
	video.autoplay = true;
	video.loop = true; 
	video.src = 'videos/reef_1920_4.webm';

	var texture = new THREE.VideoTexture(video);

	var mat = new THREE.MeshBasicMaterial({ map: texture });
	//mat.side = THREE.BackSide;

	var mesh = new THREE.Mesh(geo, mat);

	scene.add(mesh);
}

function setupLights() {
	var light = new THREE.DirectionalLight(0xffffff, 1.5);
	light.position.set(1, 1, 1);
	scene.add(light);

	light = new THREE.DirectionalLight(0xffffff, 0.75);
	light.position.set(-1, -0.5, -1);
	scene.add(light);

	light = new THREE.AmbientLight(0x666666);
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

	//renderer.setSize(window.innerWidth, window.innerHeight);
}

function keyPressed (e) {

	// TODO: add player controls

	console.log(e.keyCode);
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



