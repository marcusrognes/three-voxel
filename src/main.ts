import './style.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import Stats from 'stats.js';
import { World } from './voxel/world';
import { WorldData } from './voxel/worldData';
import { SimplexNoise3DPipe } from './voxel/pipe/SimplexNoise3DPipe';
import { SimplexNoise2DPipe } from './voxel/pipe/SimplexNoise2DPipe';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
const clock = new THREE.Clock(true);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
const targetObject = new THREE.Object3D();
targetObject.position.z = 10;
targetObject.position.x = 10;
targetObject.position.y = -10;
scene.add(targetObject);

directionalLight.target = targetObject;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(directionalLight);
scene.add(ambientLight);

controls.update();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const stats = new Stats();
const deltaPanel = stats.addPanel(new Stats.Panel("MS Delta", '#ff8', '#221'));

stats.showPanel(2);
stats.setMode(0);

document.body.appendChild(stats.dom);

camera.position.z = 200;
camera.position.y = 200;

const voxelWorld = new World({
	chunkSize: new THREE.Vector3(64, 64, 64),
	voxelSize: new THREE.Vector3(1, 1, 1),
	lockedBounds: new THREE.Box3(new THREE.Vector3(-10, -10, -10), new THREE.Vector3(10, 10, 10)),
	worldData: new WorldData({
		pipes: [
			new SimplexNoise2DPipe({
				size: 0.01,
				seed: 3980,
				threshold: 0,
			}),
			new SimplexNoise3DPipe({
				size: 0.002,
				seed: 3980,
				threshold: 0,
			})
		]
	}),
});

const detailsCurve = new THREE.SplineCurve([
	new THREE.Vector2(1, 0),
	new THREE.Vector2(2, 0),
	new THREE.Vector2(8, 0),
	new THREE.Vector2(16, 0),
	new THREE.Vector2(32, 0),
	new THREE.Vector2(32, 0),
]);

const chunks = voxelWorld.generateChunksAround(new THREE.Vector3(), new THREE.Vector3(15, 2, 15), detailsCurve);
chunks.forEach(chunk => scene.add(chunk));

function animate() {
	const delta = clock.getDelta();
	deltaPanel.update(delta * 1000, 40);
	stats.update();

	controls.update();
	renderer.render(scene, camera);

}

renderer.setAnimationLoop(animate);


