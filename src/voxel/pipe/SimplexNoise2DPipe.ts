import { Vector3, Vector4 } from "three";
import type { WorldDataPipe } from "../worldData";

import { createNoise2D, type NoiseFunction2D } from 'simplex-noise';
import alea from 'alea';

export class SimplexNoise2DPipe implements WorldDataPipe {
	seed: any;
	size: number;
	threshold: number;
	prng: ReturnType<typeof alea>;
	noise: NoiseFunction2D;
	constructor(settings: { seed: any, size: number, threshold: number }) {
		this.seed = settings.seed;
		this.size = settings.size || 1;
		this.threshold = settings.threshold || 0;

		this.prng = alea(this.seed || 1);
		this.noise = createNoise2D(this.prng);
	}

	sample(position: Vector3, previousValue?: Vector4): Vector4 {
		if (previousValue && previousValue.w <= this.threshold) {
			return new Vector4(0, 0, 0, 0);
		}

		const noise = this.noise(position.x * this.size, position.z * this.size) * 10;

		if (!previousValue) {
			previousValue = new Vector4();
		}

		previousValue.w = position.y < noise ? 1 : 0;

		return previousValue.clone();
	};
}
