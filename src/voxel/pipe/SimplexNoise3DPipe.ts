import { Vector3, Vector4 } from "three";
import type { WorldDataPipe } from "../worldData";

import { createNoise3D, type NoiseFunction3D } from 'simplex-noise';
import alea from 'alea';

export class SimplexNoise3DPipe implements WorldDataPipe {
	seed: any;
	size: number;
	threshold: number;
	prng: ReturnType<typeof alea>;
	noise: NoiseFunction3D;

	constructor(settings: { seed: any, size: number, threshold: number }) {
		this.seed = settings.seed;
		this.size = settings.size || 1;
		this.threshold = settings.threshold || 0;

		this.prng = alea(this.seed || 1);
		this.noise = createNoise3D(this.prng);
	}

	sample(position: Vector3, previousValue?: Vector4): Vector4 {
		if (previousValue && previousValue.w <= this.threshold) {
			return new Vector4(0, 0, 0, 0);
		}

		const noise = this.noise(position.x * this.size, position.y * this.size, position.z * this.size) + 0.6;

		if (!previousValue) {
			previousValue = new Vector4();
		}

		previousValue.w = noise;

		return previousValue.clone();
	};
}
