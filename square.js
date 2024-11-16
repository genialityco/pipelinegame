import * as THREE from 'three';
import imgUrl from './textures/textureHoyo.jpg'

export default function squareasset(x, y, z) {
	var cubeGeometry = new THREE.CircleGeometry(6, 32, 2);
	const loader = new THREE.TextureLoader();
	const texture = loader.load(imgUrl);
	var cubeMaterial = new THREE.MeshBasicMaterial({
		map: texture,
	});
	var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	cube.name = 'cube';
	cube.position.set(x, y, z);
	var bbox = new THREE.Box3().setFromObject(cube);
	console.log('cubebbox', bbox);
	cube.geometry.userData.bbox = bbox;
	//OBB
	// cube.geometry.userData.obb = new OBB().fromBox3(cube.geometry.boundingBox);
	// cube.userData.obb = new OBB();
	return cube;
}
