import * as THREE from 'three';
export default function scenario() {
	const marginOptions = 100; // margen dejado para los botones de control
	const canvas = document.getElementById('canvas');
	//set up the ratio
	var gWidth = window.innerWidth;
	var gHeight = window.innerHeight - marginOptions;
	var ratio = gWidth / gHeight;

	//set the scene
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xeaeaea);

	//set the camera
	var camera = new THREE.PerspectiveCamera(35, ratio, 0.1, 1000);
	camera.position.z = 120;

	//set the light
	var light = new THREE.SpotLight(0xffffff, 1);
	light.position.set(100, 1, 0);
	light.castShadow = true;
	light.position.set(0, 0, 35);
	scene.add(light);

	//  set the renderer
	var renderer = new THREE.WebGLRenderer();

	//properties for casting shadow
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	renderer.setSize(gWidth, gHeight);
	canvas.appendChild(renderer.domElement);

	return { scene, renderer, camera };
}
