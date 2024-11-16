import * as THREE from 'three';
export default function field() {
	// create and add the field
	/* var margin = 20;
	var fieldRatio = 105 / 68; */

	const marginOptions = 100; // margen dejado para los botones de control

	var width = window.innerWidth;
	var height = window.innerHeight - marginOptions;

	var material = new THREE.MeshLambertMaterial({
		color: 'green',
	});
	var geometry = new THREE.BoxGeometry(width, height, 1);
	var field = new THREE.Mesh(geometry, material);

	field.receiveShadow = true;
	field.position.z = -1;
	return field;
}
