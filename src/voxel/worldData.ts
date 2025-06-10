import * as THREE from 'three';

export interface WorldDataPipe {
	sample: (position: THREE.Vector3, previousValue?: THREE.Vector4) => THREE.Vector4;
}

export interface WorldDataSettings {
	pipes: WorldDataPipe[]
}

export class WorldData {
	pipes: WorldDataPipe[];
	cache: THREE.Vector4[][][] = [];

	constructor(settings: WorldDataSettings) {
		this.pipes = settings.pipes;
	}

	setCachedValue(position: THREE.Vector3, value: THREE.Vector4) {
		if (!this.cache[position.x]) {
			this.cache[position.x] = [];
		}

		if (!this.cache[position.x][position.y]) {
			this.cache[position.x][position.y] = [];
		}

		this.cache[position.x][position.y][position.z] = value;
	}

	sample(position: THREE.Vector3) {
		const cachedValue = this.cache[position.x]?.[position.y]?.[position.z] ?? null;

		if (cachedValue) {
			return cachedValue;
		}

		let currentValue = new THREE.Vector4();

		for (let i = 0; i < this.pipes.length; i++) {
			currentValue = this.pipes[i].sample(position, currentValue);
		}


		return currentValue;
	}

}

