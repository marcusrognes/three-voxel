import * as THREE from 'three';
import type { WorldData } from './worldData';


export class World {
	public lockedBounds: THREE.Box3;
	public worldData: WorldData;
	public chunkSize: THREE.Vector3;
	public voxelSize: THREE.Vector3;
	public box: THREE.BoxGeometry;
	public material: THREE.Material;

	constructor(props: { chunkSize: THREE.Vector3, voxelSize: THREE.Vector3, lockedBounds: THREE.Box3, worldData: WorldData }) {
		this.lockedBounds = props.lockedBounds;
		this.worldData = props.worldData;
		this.chunkSize = props.chunkSize;
		this.voxelSize = props.voxelSize;

		const boxScale = 1;

		this.box = new THREE.BoxGeometry(this.voxelSize.x * boxScale, this.voxelSize.y * boxScale, this.voxelSize.z * boxScale);
		this.material = new THREE.MeshStandardMaterial({ color: 0x00ffff });
	}

	generateChunk(position: THREE.Vector3, skip: number = 1) {
		const chunkIndex = new THREE.Vector3(
			Math.floor(position.x / this.chunkSize.x),
			Math.floor(position.y / this.chunkSize.y),
			Math.floor(position.z / this.chunkSize.z),
		);


		const startPosition = chunkIndex.clone().multiply(this.chunkSize).multiply(this.voxelSize);
		const instances: THREE.Matrix4[] = [];

		for (let x = 0; x < this.chunkSize.x; x += skip) {
			for (let y = 0; y < this.chunkSize.y; y += skip) {
				for (let z = 0; z < this.chunkSize.z; z += skip) {
					const currentPosition = new THREE.Vector3(
						startPosition.x + (x * this.voxelSize.x),
						startPosition.y + (y * this.voxelSize.y),
						startPosition.z + (z * this.voxelSize.z),
					);
					const pointData = this.worldData.sample(currentPosition);

					if (pointData.w <= 0) {
						continue;
					}

					const matrix = new THREE.Matrix4();
					matrix.setPosition(currentPosition);
					matrix.scale(new THREE.Vector3(skip, skip, skip))
					instances.push(matrix);
				}
			}
		}

		const instancedMesh = new THREE.InstancedMesh(this.box, this.material, instances.length);

		for (let i = 0; i < instances.length; i++) {
			instancedMesh.setMatrixAt(i, instances[i]);
		}

		instancedMesh.instanceMatrix.needsUpdate = true;

		return instancedMesh;
	}

	generateChunksAround(position: THREE.Vector3, distance: THREE.Vector3, detailCurve: THREE.Curve<THREE.Vector2>) {
		const start = new THREE.Vector3(
			position.x - (distance.x * this.chunkSize.x * this.voxelSize.x),
			position.y - (distance.y * this.chunkSize.y * this.voxelSize.y),
			position.z - (distance.z * this.chunkSize.z * this.voxelSize.z),
		);

		const stop = new THREE.Vector3(
			position.x + (distance.x * this.chunkSize.x * this.voxelSize.x),
			position.y + (distance.y * this.chunkSize.y * this.voxelSize.y),
			position.z + (distance.z * this.chunkSize.z * this.voxelSize.z),

		);

		const furthestDistance = start.distanceTo(stop) / 2;

		const meshes: THREE.InstancedMesh[] = [];

		const offset = new THREE.Vector3(distance.x / 2, distance.y / 2, distance.z / 2);

		for (let x = 0; x < distance.x; x++) {
			for (let y = 0; y < distance.y; y++) {
				for (let z = 0; z < distance.z; z++) {
					const chunkPosition = new THREE.Vector3(x, y, z).sub(offset).multiply(this.chunkSize).multiply(this.voxelSize);
					const distance = position.distanceTo(chunkPosition) / furthestDistance;

					meshes.push(this.generateChunk(chunkPosition, detailCurve.getPoint(
						distance
					).x));
				}
			}
		}

		return meshes;
	}
}

