import './style.css';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { EaselPlugin } from 'gsap/EaselPlugin';
import { TextPlugin } from 'gsap/TextPlugin';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';

gsap.registerPlugin(Flip, EaselPlugin, TextPlugin);

var gameOver = false;

const scene = new THREE.Scene();
const canvasContainer = document.querySelector('#canvasContainer');
let gravityMaxValue = -9;
let tableOffset = 4;

const physicsWorld = new CANNON.World({
	gravity: new CANNON.Vec3(0, gravityMaxValue, 0),
});

function linkPhysics() {
	for (let i = 0; i < candyPhysicsArray.length; i++) {
		candyVisualArray[i].position.copy(candyPhysicsArray[i].position);
		candyVisualArray[i].quaternion.copy(candyPhysicsArray[i].quaternion);
	}
}

physicsWorld.defaultContactMaterial.contactEquationRestitution = 0.1;
physicsWorld.defaultContactMaterial.contactEquationStiffness = 5000;
physicsWorld.defaultContactMaterial.friction = 3;
physicsWorld.defaultContactMaterial.contactEquationRelaxationTime = 0.5;

window.onresize = function () {
	resetTower();
};

const camera = new THREE.PerspectiveCamera(
	45,
	canvasContainer.offsetWidth / canvasContainer.offsetHeight,
	0.5,
	1000,
);
camera.position.set(5, 2, 20);

if (window.innerWidth < 768) {
	camera.position.set(5, 0.5, 20);
}

window.addEventListener('resize', () => {
	if (window.innerWidth < 768) {
		camera.position.set(5, 0.5, 20);
	} else {
		camera.position.set(5, 2, 20);
	}
});

const renderer = new THREE.WebGLRenderer({
	antialias: true,
	canvas: document.querySelector('canvas'),
});
renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const light = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(light);

var panoGeometry = new THREE.SphereGeometry(50, 60, 40);
panoGeometry.scale(-1, 1, 1);
var panoMaterial = new THREE.MeshBasicMaterial({
	map: new THREE.TextureLoader().load('./tower_images/pano2.jpg'),
});
var panoMesh = new THREE.Mesh(panoGeometry, panoMaterial);
panoMesh.position.set(0, 0, 0);
scene.add(panoMesh);

const gameLight = new THREE.PointLight(0xffffff, 0.7, 2000);
gameLight.castShadow = true;
gameLight.position.set(-3, 10, 3);
scene.add(gameLight);

const fillLight = new THREE.PointLight(0xffffff, 0.4, 2000);
fillLight.castShadow = true;
fillLight.position.set(2, 10, -2);
scene.add(fillLight);

const tableTexture = new THREE.TextureLoader().load('./tower_images/wood.jpg');
const tableBody = new CANNON.Body({
	shape: new CANNON.Cylinder(5, 5, 0.25, 50),
	type: CANNON.Body.STATIC,
});
tableBody.position.set(0, 0 - tableOffset, 0);
physicsWorld.addBody(tableBody);
const tableVisualBody = new THREE.Mesh(
	new THREE.CylinderGeometry(5, 5, 0.25, 50),
	new THREE.MeshStandardMaterial({
		map: tableTexture,
	}),
);
tableVisualBody.receiveShadow = true;
scene.add(tableVisualBody);
tableVisualBody.userData.ground = true;
tableVisualBody.position.copy(tableBody.position);
tableVisualBody.quaternion.copy(tableBody.quaternion);

const tableLegBody = new CANNON.Body({
	shape: new CANNON.Cylinder(0.7, 0.7, 16, 50),
	type: CANNON.Body.STATIC,
});
tableLegBody.position.set(0, -8 - tableOffset, 0);
physicsWorld.addBody(tableLegBody);
const tableLegVisualBody = new THREE.Mesh(
	new THREE.CylinderGeometry(0.7, 0.7, 16, 50),
	new THREE.MeshStandardMaterial({
		map: tableTexture,
	}),
);
tableLegVisualBody.receiveShadow = true;
scene.add(tableLegVisualBody);
tableLegVisualBody.userData.ground = true;
tableLegVisualBody.position.copy(tableLegBody.position);
tableLegVisualBody.quaternion.copy(tableLegBody.quaternion);

const candyPhysicsArray = [];
const candyVisualArray = [];

const holdingBoxnx = new THREE.BoxGeometry(0.1, 3, 3, 10, 10, 10);
const holdingBoxpx = new THREE.BoxGeometry(0.1, 3, 3, 10, 10, 10);
const holdingBoxbottom = new THREE.BoxGeometry(3, 0.1, 3, 10, 10, 10);
const holdingBoxnz = new THREE.BoxGeometry(3, 3, 0.1, 10, 10, 10);
const holdingBoxpz = new THREE.BoxGeometry(3, 3, 0.1, 10, 10, 10);

const jarMesh = new THREE.MeshStandardMaterial({
	transparent: true,
	opacity: 0.1,
	color: 0x010000,
});
const boxSidenx = new THREE.Mesh(holdingBoxnx, jarMesh);
const boxSidepx = new THREE.Mesh(holdingBoxpx, jarMesh);
const boxSidebottom = new THREE.Mesh(holdingBoxbottom, jarMesh);
const boxSidenz = new THREE.Mesh(holdingBoxnz, jarMesh);
const boxSidepz = new THREE.Mesh(holdingBoxpz, jarMesh);

scene.add(boxSidenx);
candyVisualArray.push(boxSidenx);
scene.add(boxSidepx);
candyVisualArray.push(boxSidepx);
scene.add(boxSidebottom);
candyVisualArray.push(boxSidebottom);
scene.add(boxSidenz);
candyVisualArray.push(boxSidenz);
scene.add(boxSidepz);
candyVisualArray.push(boxSidepz);

const boxPhysicsnx = new CANNON.Body({
	STATIC: true,
	shape: new CANNON.Box(new CANNON.Vec3(0.05, 1.5, 1.5)),
});
boxPhysicsnx.position.set(1.5, 1.6 - tableOffset, 0);
const boxPhysicspx = new CANNON.Body({
	STATIC: true,
	shape: new CANNON.Box(new CANNON.Vec3(0.05, 1.5, 1.5)),
});
boxPhysicspx.position.set(-1.5, 1.6 - tableOffset, 0);
const boxPhysicsbottom = new CANNON.Body({
	STATIC: true,
	shape: new CANNON.Box(new CANNON.Vec3(1.5, 0.05, 1.5)),
});
boxPhysicsbottom.position.set(0, 0.1 - tableOffset, 0);
const boxPhysicsnz = new CANNON.Body({
	STATIC: true,
	shape: new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 0.05)),
});
boxPhysicsnz.position.set(0, 1.6 - tableOffset, 1.5);
const boxPhysicspz = new CANNON.Body({
	STATIC: true,
	shape: new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 0.05)),
});
boxPhysicspz.position.set(0, 1.6 - tableOffset, -1.5);

physicsWorld.addBody(boxPhysicsnx);
candyPhysicsArray.push(boxPhysicsnx);
physicsWorld.addBody(boxPhysicspx);
candyPhysicsArray.push(boxPhysicspx);
physicsWorld.addBody(boxPhysicsbottom);
candyPhysicsArray.push(boxPhysicsbottom);
physicsWorld.addBody(boxPhysicsnz);
candyPhysicsArray.push(boxPhysicsnz);
physicsWorld.addBody(boxPhysicspz);
candyPhysicsArray.push(boxPhysicspz);

let listOfEachCandy = [];
const colorSheet = [0xff0000, 0x00ff00, 0x0000ff, 0xe2619f, 0xffef00, 0xf88128];

function createCandy(candyName, position, color) {
	const mass = 0.0001;
	candyName = new CANNON.Body({
		mass: mass,
		shape: new CANNON.Sphere(0.15),
		sleepSpeedLimit: 0.5,
	});
	candyName.position.set(position.x, position.y, position.z);
	physicsWorld.addBody(candyName);
	listOfEachCandy.push(candyName);
	candyPhysicsArray.push(candyName);
	const sphereGeometry = new THREE.SphereGeometry(0.15, 15, 15);
	const sphereMesh = new THREE.MeshStandardMaterial({
		color: color,
		roughness: 0,
	});
	candyName = new THREE.Mesh(sphereGeometry, sphereMesh);
	scene.add(candyName);
	candyVisualArray.push(candyName);
}

let numberOfCandy = 400 + Math.floor(Math.random() * 500);
function placeCandy() {
	let candyY = -tableOffset;
	for (let i = 0; i < numberOfCandy; i++) {
		let candyColor = Math.floor(Math.random() * colorSheet.length);
		var color = colorSheet[candyColor];
		if (i % 20 == 0) {
			candyY += 0.3;
		}
		let candyX = Math.cos(2 * Math.PI * i * 0.05);
		let candyZ = Math.sin(2 * Math.PI * i * 0.05);
		const position = { x: candyX, y: candyY, z: candyZ };
		createCandy('candy', position, color);
	}
}

placeCandy();

const fontLoader = new FontLoader();
fontLoader.load(
	new URL('./fonts/Pixle_Font_Medium.json', import.meta.url),
	(droidFont) => {
		const textGeometry = new TextGeometry(numberOfCandy.toString(), {
			height: 0.05,
			size: 0.3,
			rotationZ: Math.PI / 2,
			font: droidFont,
		});
		const textMaterial = new THREE.MeshBasicMaterial({
			color: 0xe2619f,
		});
		const textMesh = new THREE.Mesh(textGeometry, textMaterial);
		textMesh.position.set(-0.25, 0.3 - tableOffset, 0.15);
		textMesh.rotation.set(-Math.PI / 2, 0, 0);
		scene.add(textMesh);
	},
);

const resetButton = document.getElementById('button1');
function resetTower() {
	location.reload();
}
resetButton.addEventListener('click', function () {
	resetTower();
});

resetButton.addEventListener('mouseover', function () {
	resetButton.className =
		'font-bold border-4 text-green-600 bg-blue-600 border-green-600 inline-block px-4 py-1 rounded-full';
});
resetButton.addEventListener('mouseout', () => {
	resetButton.className =
		'font-bold border-4 text-green-600 bg-yellow-400 border-green-600 inline-block px-4 py-1 rounded-full';
});

const guessButton = document.getElementById('guessButton');
guessButton.addEventListener('mouseover', function () {
	guessButton.className =
		'font-bold border-4 text-green-600 bg-blue-600 border-green-600 inline-block px-4 py-1 rounded-full';
});
guessButton.addEventListener('mouseout', () => {
	guessButton.className =
		'font-bold border-4 text-green-600 bg-yellow-400 border-green-600 inline-block px-4 py-1 rounded-full';
});

let guessCount = 0;

const tooLowInt = [];
const tooHighInt = [];
const lowGuesses = document.getElementById('lowGuesses');
const highGuesses = document.getElementById('highGuesses');
const gameMessage = document.getElementById('gameMessage');

const mobileMessage = document.getElementById('mobileMessage');
const mobileGuess = document.getElementById('mobileGuess');
const mobileGuessButton = document.getElementById('mobileGuessButton');
const mobileResetButton = document.getElementById('mobileResetButton');

function getLowestLow() {
	return tooLowInt.length ? Math.max(...tooLowInt) : null;
}

function getHighestHigh() {
	return tooHighInt.length ? Math.min(...tooHighInt) : null;
}

function getRangeMessage() {
	const low = getLowestLow();
	const high = getHighestHigh();

	if (low !== null && high !== null) {
		return `Please choose a number between ${low + 1} and ${high - 1}.`;
	}

	if (low !== null) {
		return `Please choose a number higher than ${low}.`;
	}

	if (high !== null) {
		return `Please choose a number lower than ${high}.`;
	}

	return 'Enter a number between 0 and 1000.';
}

function syncMessages() {
	if (mobileMessage) {
		mobileMessage.innerText = gameMessage.innerText;
	}
}

function checkGuess() {
	let guessedNumber = Number(document.getElementById('playerGuess').value);

	if (guessedNumber === 0) {
		gameMessage.innerText = "The number of GumBalls isn't 0! Guess again.";
		syncMessages();
		return;
	}

	if (gameOver) {
		gameMessage.innerText = `You already won! The number is still ${numberOfCandy}.`;
		syncMessages();
		return;
	}

	if (tooLowInt.includes(guessedNumber) || tooHighInt.includes(guessedNumber)) {
		gameMessage.innerText = 'You already guessed that number. Try a new one.';
		syncMessages();
		return;
	}

	guessCount++;

	if (guessedNumber === numberOfCandy) {
		gameOver = true;
		gameMessage.innerText = `You guessed it in ${guessCount} tries! There are ${numberOfCandy} GumBalls!`;
		winGame();
		syncMessages();
		return;
	}

	if (guessedNumber < numberOfCandy) {
		tooLowInt.push(guessedNumber);
		tooLowInt.sort((a, b) => a - b);
		lowGuesses.innerText = 'Low Guesses: ' + tooLowInt.join(', ');
	}

	if (guessedNumber > numberOfCandy) {
		tooHighInt.push(guessedNumber);
		tooHighInt.sort((a, b) => a - b);
		highGuesses.innerText = 'High Guesses: ' + tooHighInt.join(', ');
	}

	gameMessage.innerText = getRangeMessage();
	syncMessages();
}

guessButton.addEventListener('click', () => {
	checkGuess();
	document.getElementById('playerGuess').value = '';
});

window.onkeyup = function (e) {
	let key = e.key.toLowerCase();
	if (key === 'enter') {
		checkGuess();
		document.getElementById('playerGuess').value = '';
	}
};

if (mobileGuessButton) {
	mobileGuessButton.addEventListener('click', () => {
		document.getElementById('playerGuess').value = mobileGuess.value;
		checkGuess();
		mobileGuess.value = '';
	});
}

if (mobileResetButton) {
	mobileResetButton.addEventListener('click', resetTower);
}

syncMessages();

function explodeCandy() {
	for (let i = 0; i < listOfEachCandy.length; i++) {
		let randoX = (Math.random() - 0.51) * 0.005;
		let randoZ = (Math.random() - 0.49) * 0.005;
		let randoY = (Math.random() + 0.5) * 0.0015;
		listOfEachCandy[i].applyImpulse(
			new CANNON.Vec3(randoX, randoY, randoZ),
			new CANNON.Vec3(0, 0, 0),
		);
	}
}

const rotateGeometry = new THREE.SphereGeometry(1, 3, 2);
const rotateMaterial = new THREE.MeshBasicMaterial({ visible: false });
const rotatePoint = new THREE.Mesh(rotateGeometry, rotateMaterial);
scene.add(rotatePoint);

function winGame() {
	const fontLoader = new FontLoader();

	fontLoader.load(
		new URL('./fonts/Pixle_Font_Medium.json', import.meta.url),
		(droidFont) => {
			const textGeometry = new TextGeometry('YOU WIN', {
				height: 0.2,
				size: 0.6,
				rotationZ: Math.PI / 2,
				font: droidFont,
			});
			const textMaterial = new THREE.MeshBasicMaterial({
				color: 0xe2619f,
			});
			const textMesh = new THREE.Mesh(textGeometry, textMaterial);
			textMesh.position.set(-1.6, 1.5 - tableOffset, 2);
			textMesh.rotation.set(0, 0, 0);
			rotatePoint.add(textMesh);
		},
	);

	fontLoader.load(
		new URL('./fonts/Pixle_Font_Medium.json', import.meta.url),
		(droidFont) => {
			const textGeometry = new TextGeometry('YOU WIN', {
				height: 0.2,
				size: 0.6,
				rotationZ: Math.PI / 2,
				font: droidFont,
			});
			const textMaterial = new THREE.MeshBasicMaterial({
				color: 0x0000ff,
			});
			const textMesh = new THREE.Mesh(textGeometry, textMaterial);
			textMesh.position.set(1.6, 1.5 - tableOffset, -2);
			textMesh.rotation.set(0, Math.PI, 0);
			rotatePoint.add(textMesh);
		},
	);

	fontLoader.load(
		new URL('./fonts/Pixle_Font_Medium.json', import.meta.url),
		(droidFont) => {
			const textGeometry = new TextGeometry('YOU WIN', {
				height: 0.2,
				size: 0.6,
				rotationZ: Math.PI / 2,
				font: droidFont,
			});
			const textMaterial = new THREE.MeshBasicMaterial({
				color: 0xff0000,
			});
			const textMesh = new THREE.Mesh(textGeometry, textMaterial);
			textMesh.position.set(-2, 1.5 - tableOffset, -1.6);
			textMesh.rotation.set(0, -Math.PI / 2, 0);
			rotatePoint.add(textMesh);
		},
	);

	fontLoader.load(
		new URL('./fonts/Pixle_Font_Medium.json', import.meta.url),
		(droidFont) => {
			const textGeometry = new TextGeometry('YOU WIN', {
				height: 0.2,
				size: 0.6,
				rotationZ: Math.PI / 2,
				font: droidFont,
			});
			const textMaterial = new THREE.MeshBasicMaterial({
				color: 0x00ff00,
			});
			const textMesh = new THREE.Mesh(textGeometry, textMaterial);
			textMesh.position.set(2, 1.5 - tableOffset, 1.6);
			textMesh.rotation.set(0, Math.PI / 2, 0);
			rotatePoint.add(textMesh);
		},
	);

	explodeCandy();
}

function animate() {
	requestAnimationFrame(animate);
	physicsWorld.fixedStep();
	linkPhysics();
	renderer.render(scene, camera);

	if (gameOver == true) {
		rotatePoint.rotation.y += -0.015;
	}
}

animate();
