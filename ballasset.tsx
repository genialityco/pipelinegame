import * as THREE from 'three';
import imgUrl from './textures/textureGolf.jpg'
export default function ballasset(
	ballRadius,
	ballCircumference,
	ballVelocity,
	ballRotationAxis
) {
	// create and add the ball
	var geometry = new THREE.SphereGeometry(ballRadius, 18, 18);

	//make a checkerboard texture for the ball...
	/* var canv = document.createElement('canvas');
	canv.width = canv.height = 256; */
	/* var ctx = canv.getContext('2d');
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, 0, 256, 256);
	ctx.fillStyle = '#989898';

	for (var y = 0; y < 16; y++)
		for (var x = 0; x < 16; x++)
			if ((x & 1) != (y & 1)) ctx.fillRect(x * 16, y * 16, 16, 16); */

	const loader = new THREE.TextureLoader();
	const texture = loader.load(imgUrl);
	/* var ballTex = new THREE.Texture(canv);
	ballTex.needsUpdate = true; */

	var material = new THREE.MeshBasicMaterial({
		color: 'rgb(233,230,234)',
		map: texture,
	});
	var ball = new THREE.Mesh(geometry, material);

	ball.castShadow = true;
	ball.receiveShadow = false;

	//OBB
	var bbox = new THREE.Box3().setFromObject(ball);
	console.log('bbox', bbox);
	ball.geometry.userData.bbox = bbox;
	//ball.geometry.userData.obb = new OBB().fromBox3(ball.geometry.boundingBox as THREE.Box3);
	//ball.userData.obb = new OBB();

	return ball;
}
