import * as THREE from 'three';
import scenario from './scenario.js';
import ballasset from './ballasset.tsx';
import squareasset from './square.js';
import fieldasset from './field.js';
import { FirebaseDB, FBRealTime } from './firebase/ConfigFirebase';
import presencefirebase from './presencefirebase.js';
import {
	ref,
	set,
	get,
	serverTimestamp,
	onValue,
	query,
	orderByChild,
	endBefore,
} from 'firebase/database';

/*
 *
 * SET UP MOTION PARAMS
 *
 */

var global = {
	myposition: null,
	ballposition: null,
	ball: null,
	scene: null,
	testmode: false,
};

var globalgetter = function () {
	return global;
};
var globalsetter = function (objeto) {
	global = { ...global, ...objeto };
};

var degrees = 35;
var power = 0.4;
var angleRad = (degrees * Math.PI) / 180;

var velocityX = 0; //Math.cos(angleRad) * power;
var velocityY = 0; //Math.sin(angleRad) * power;
var velocityZ = 0; //0//1;

var friction = 1;
var gravity = 0.2;
var bounciness = 0.9;

var ballRadius = 5;
var ballCircumference = Math.PI * ballRadius * 2;
var ballVelocity = new THREE.Vector3();
var ballRotationAxis = new THREE.Vector3(0, 1, 0);
var inclination = { beta: 0, gamma: 0 };

var gammacontenedor = document.getElementById('gammacontenedor');
var betacontenedor = document.getElementById('betacontenedor');
var alphacontenedor = document.getElementById('alphacontenedor');
var statuscontenedor = document.getElementById('status');

console.log('inicia el juego', window.DeviceOrientationEvent);

const handleDeviceorientationEvent = (event) => {
	let alpha =
		Math.round((event.alpha || event?.rotationRate.alpha || 0) * 10) / 10;
	let gamma =
		Math.round((event.gamma || event?.rotationRate.gamma || 0) * 10) / 10;
	let beta =
		Math.round((event.beta || event?.rotationRate.beta || 0) * 10) / 10;
	console.log('handleMotionEvent', alpha, gamma, beta);

	velocityY = -beta / 90; //-event.accelerationIncludingGravity.x * 5//ancho
	velocityX = gamma / 90; //event.accelerationIncludingGravity.y * 5//largo
	//velocityZ =  alpha/90//event.accelerationIncludingGravity.y * 5

	inclination = { gamma: gamma, beta: beta };
	gammacontenedor.innerHTML = gamma;
	betacontenedor.innerHTML = beta;
	alphacontenedor.innerHTML = beta;
};
const handleMotionEvent = (event) => {
	console.log('handleDeviceorientationEvent', event);
};

function testDeviceOrientation() {
	// if (DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
	//   alert("Solicitando permiso", DeviceOrientationEvent.requestPermission);
	//   DeviceOrientationEvent.requestPermission().then(function (response) {
	//     alert(response);
	//     window.addEventListener("devicemotion", handleMotionEvent, true);
	//     window.addEventListener("deviceorientation", handleDeviceorientationEvent, true);
	//   });
	// }

	if (typeof DeviceOrientationEvent !== 'function') {
		return setResult('DeviceOrientationEvent not detected');
	}
	if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
		return setResult('DeviceOrientationEvent.requestPermission not detected');
	}
	DeviceOrientationEvent.requestPermission().then(function (result) {
		window.addEventListener('devicemotion', handleMotionEvent, true);
		window.addEventListener(
			'deviceorientation',
			handleDeviceorientationEvent,
			true
		);
		return setResult(result);
	});
}

function setResult(result) {
	document.getElementById('result').innerHTML = 'RESULT: ' + result;
}

window.addEventListener('devicemotion', handleMotionEvent, true);
window.addEventListener(
	'deviceorientation',
	handleDeviceorientationEvent,
	true
);

window.onload = async function (params) {
	//aqui cargamos al usuario y la posición que tiene

	//alert("window onload", DeviceOrientationEvent);

	gammacontenedor = document.getElementById('gammacontenedor');
	betacontenedor = document.getElementById('betacontenedor');
	alphacontenedor = document.getElementById('alphacontenedor');

	statuscontenedor.addEventListener('click', testDeviceOrientation);

	//gamma es x
	//beta es y
	const wbase = 393;
	const hbase = 873;
	const borderbaseX = 18;
	const borderbaseY = 33;
	/*
  calculo de los bordes segun las dimensiones del dispositivo
  Borderx = borde en el eje x del escenario
  Bordery = borde en el eje y del escenario
  *
  */
	const borderX = (window.innerWidth * borderbaseX) / wbase;
	const borderY = (window.innerHeight * borderbaseY) / hbase;
	var borders = [borderX, borderY]; //indicate where the ball needs to move in mirror position
	/*
	 * SET UP THE WORLD
	 */
	var { scene, renderer, camera } = scenario();

	const ball = ballasset(
		ballRadius,
		ballCircumference,
		ballVelocity,
		ballRotationAxis
	);
	global.ball = ball;
	global.scene = scene;
	const field = fieldasset();
	const square = squareasset(0, 0, 0);

	//activamos el usuario
	await presencefirebase(globalgetter, globalsetter);

	function generarValorAleatorio(value) {
		return Math.random() * (value * 2) - value;
	}

	ball.position.x = Math.floor(generarValorAleatorio(borders[0]));
	ball.position.y = Math.floor(generarValorAleatorio(borders[1]));

	//scene.add(ball);
	scene.add(square);
	scene.add(field);

	const testmodeRef = ref(FBRealTime, '/testmode');
	onValue(testmodeRef, (snapshot) => {
		const testmode = snapshot.val() || false;
		global.testmode = testmode;
	});

	const ballRef = ref(FBRealTime, '/ballposition');
	onValue(ballRef, (snapshot) => {
		//margen para evitar que la pelota aparezca cerca del cuadro
		const lowMargin = 5;
		const posicionbola = snapshot.val() || 0;
		global.ballposition = posicionbola;
		if (global.myposition == global.ballposition || global.testmode) {
			scene.add(ball);
			velocityX = 0;
			velocityZ = 0;
			velocityY = 0;
			ball.position.x = Math.floor(generarValorAleatorio(borders[0]));
			//ball.position.z += Math.floor(generarValorAleatorio() * 30) ;
			ball.position.y = Math.floor(generarValorAleatorio(borders[1]));
			square.position.x = -ball.position.x + lowMargin;
			square.position.y = -ball.position.y + lowMargin;
		} else {
			scene.remove(ball);
		}
		console.log('globalposition', global);
	});

	/*
	 * setting up rotation axis
	 */
	var rotation_matrix = null;

	var setQuaternions = function () {
		setMatrix();
		ball.rotation.set(Math.PI / 2, Math.PI / 4, Math.PI / 4); // Set initial rotation
		ball.matrix.makeRotationFromEuler(ball.rotation); // Apply rotation to the object's matrix
	};

	var setMatrix = function () {
		rotation_matrix = new THREE.Matrix4().makeRotationZ(angleRad); // Animated rotation will be in .01 radians along object's X axis
	};

	setQuaternions();

	/*
	 *
	 * ANIMATION STEP
	 *
	 */

	var render = function (params) {
		// add velocity to ball
		ball.position.x += velocityX;
		ball.position.z += velocityZ;
		ball.position.y += velocityY;

		// //validate if ball is stop moving
		// if (Math.abs(velocityX) < 0.02 && Math.abs(velocityY) < 0.02) {
		//   console.log("DONE!");
		//   return;
		// }

		// // handle boucing effect
		if (ball.position.z < 1) {
			velocityZ *= -bounciness;
			ball.position.z = 1;
		}

		// Update the object's rotation & apply it
		//  ball.matrix.multiply(rotation_matrix);   ball.rotation.setFromRotationMatrix(ball.matrix);
		// //set up the matrix
		// setMatrix();

		// Figure out the rotation based on the velocity and radius of the ball...
		ballVelocity.set(velocityX, velocityY, velocityZ);
		ballRotationAxis.set(0, 0, 1).cross(ballVelocity).normalize();
		var velocityMag = ballVelocity.length();
		var rotationAmount = (velocityMag * (Math.PI * 2)) / ballCircumference;
		ball.rotateOnWorldAxis(ballRotationAxis, rotationAmount);

		// //reducing speed by friction
		// angleRad *= friction;
		// velocityX *= friction;
		// velocityY *= friction;
		// velocityZ *= friction;

		// //validate ball is withing its borders otherwise go in the mirror direction
		if (Math.abs(ball.position.x) > borders[0]) {
			velocityX *= -1;
			ball.position.x = ball.position.x < 0 ? borders[0] * -1 : borders[0];
		}

		if (Math.abs(ball.position.y) > borders[1]) {
			velocityY *= -1;
			ball.position.y = ball.position.y < 0 ? borders[1] * -1 : borders[1];
		}

		// // reduce ball height with gravity
		velocityZ -= gravity;

		//colition
		var bboxcube = new THREE.Box3().setFromObject(square);
		var bboxball = new THREE.Box3().setFromObject(ball);

		//Colision
		if (
			bboxball.min.x <= bboxcube.max.x &&
			bboxball.max.x >= bboxcube.min.x &&
			bboxball.min.y <= bboxcube.max.y &&
			bboxball.max.y >= bboxcube.min.y
		) {
			velocityX = 0;
			velocityZ = 0;
			velocityY = 0;
			// ball.position.x += velocityX;
			// ball.position.z += velocityZ;
			// ball.position.y += velocityY;
			const ballRef = ref(FBRealTime, '/ballposition');
			if (global.ballposition == global.myposition) {
				set(ballRef, global.ballposition + 1);
			} else {
				if (global.scene && global.ball) {
					global.scene.remove(global.ball);
				}
			}
			// ball.position.x += velocityX;
			// ball.position.z += velocityZ;
			// ball.position.y += velocityY;
		}

		//render the page
		renderer.render(scene, camera);

		requestAnimationFrame(render);
	};

	render();
};
