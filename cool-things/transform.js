//Ripped from https://raw.githubusercontent.com/joshmarinacci/node-pureimage/master/src/transform.js
//transform code from https://github.com/kcmoot/transform-tracker/blob/master/transform-tracker.js


/*
 * Transform tracker
 *
 * @author Kevin Moot <kevin.moot@gmail.com>
 * Based on a class created by Simon Sarris - www.simonsarris.com - sarris@acm.org
 */

"use strict";

class Transform {
	constructor(context) {
		console.log(`Transform Start`);
		this.context = context;
		console.log(context);
		console.log(`Transform debugger 1`);
		this.matrix = [1,0,0,1,0,0]; //initialize with the identity matrix
		console.log(`Transform debugger 2`);
		this.stack = [];
		console.log(`Transform originalMethods`);
		
		this.originalMethods = {
			clearRect: context.clearRect,
			fillRect: context.fillRect,
			strokeRect: context.strokeRect,
			fillText: context.fillText,
			moveTo: context.moveTo,
			lineTo: context.lineTo,
			arc: context.arc,
			rect: context.rect,
			rockyFillRadial: context.rockyFillRadial
		};
		
		console.log(`Transform Polyfills`);
		//==========================================
		// Allowing transforms to work on CanvasRenderingContext2D methods
		//==========================================
		this.context.lineTo = function (x, y) {
			console.log(`calling out special lineto with ${x} and ${y}`);
			//var v = this.matrix.mulVector(this.currentTransform, x, y);
			let vector = new Vector2(x, y);
			console.log(`vector ${vector}`);
			
			//So we multiplied a vector
			
			let v = vector.multiply();
			console.log(`v ${v}`);
			this.matrix
			//console.log(`v is ${v}`);
			return this.originalMethods.lineTo.call(this, v.x, v.y);
		};
		console.log(`Finished Polyfills`);
		
	}
	
	getMatrix() {
		return this.matrix;
	};
	
	setMatrix(m) {
		this.matrix = [m[0],m[1],m[2],m[3],m[4],m[5]];
		this.setTransform();
	};
	
	cloneMatrix(m) {
		return [m[0],m[1],m[2],m[3],m[4],m[5]];
	};
	
	//==========================================
	// Stack
	//==========================================
	
	save() {
		var matrix = this.cloneMatrix(this.getMatrix());
		this.stack.push(matrix);
		
		if (this.context) this.context.save();
	};
	
	restore() {
		if (this.stack.length > 0) {
			var matrix = this.stack.pop();
			this.setMatrix(matrix);
		}
		
		if (this.context) this.context.restore();
	};
	
	//==========================================
	// Matrix
	//==========================================
	
	setTransform() {
		if (this.context) {
			this.context.setTransform(
				this.matrix[0],
				this.matrix[1],
				this.matrix[2],
				this.matrix[3],
				this.matrix[4],
				this.matrix[5]
			);
		}
	};
	
	translate(x, y) {
		this.matrix[4] += this.matrix[0] * x + this.matrix[2] * y;
		this.matrix[5] += this.matrix[1] * x + this.matrix[3] * y;
		
		this.setTransform();
	};
	
	rotate(rad) {
		var c = Math.cos(rad);
		var s = Math.sin(rad);
		var m11 = this.matrix[0] * c + this.matrix[2] * s;
		var m12 = this.matrix[1] * c + this.matrix[3] * s;
		var m21 = this.matrix[0] * -s + this.matrix[2] * c;
		var m22 = this.matrix[1] * -s + this.matrix[3] * c;
		this.matrix[0] = m11;
		this.matrix[1] = m12;
		this.matrix[2] = m21;
		this.matrix[3] = m22;
		
		this.setTransform();
	};
	
	scale(sx, sy) {
		this.matrix[0] *= sx;
		this.matrix[1] *= sx;
		this.matrix[2] *= sy;
		this.matrix[3] *= sy;
		
		this.setTransform();
	};
	
	//==========================================
	// Matrix extensions
	//==========================================
	
	rotateDegrees(deg) {
		var rad = deg * Math.PI / 180;
		this.rotate(rad);
	};
	
	rotateAbout(rad, x, y) {
		this.translate(x, y);
		this.rotate(rad);
		this.translate(-x, -y);
		this.setTransform();
	}
	
	rotateDegreesAbout(deg, x, y) {
		this.translate(x, y);
		this.rotateDegrees(deg);
		this.translate(-x, -y);
		this.setTransform();
	}
	
	identity() {
		this.m = [1,0,0,1,0,0];
		this.setTransform();
	};
	
	multiply(matrix) {
		var m11 = this.matrix[0] * matrix.m[0] + this.matrix[2] * matrix.m[1];
		var m12 = this.matrix[1] * matrix.m[0] + this.matrix[3] * matrix.m[1];
		
		var m21 = this.matrix[0] * matrix.m[2] + this.matrix[2] * matrix.m[3];
		var m22 = this.matrix[1] * matrix.m[2] + this.matrix[3] * matrix.m[3];
		
		var dx = this.matrix[0] * matrix.m[4] + this.matrix[2] * matrix.m[5] + this.matrix[4];
		var dy = this.matrix[1] * matrix.m[4] + this.matrix[3] * matrix.m[5] + this.matrix[5];
		
		this.matrix[0] = m11;
		this.matrix[1] = m12;
		this.matrix[2] = m21;
		this.matrix[3] = m22;
		this.matrix[4] = dx;
		this.matrix[5] = dy;
		this.setTransform();
	};
	
	invert() {
		var d = 1 / (this.matrix[0] * this.matrix[3] - this.matrix[1] * this.matrix[2]);
		var m0 = this.matrix[3] * d;
		var m1 = -this.matrix[1] * d;
		var m2 = -this.matrix[2] * d;
		var m3 = this.matrix[0] * d;
		var m4 = d * (this.matrix[2] * this.matrix[5] - this.matrix[3] * this.matrix[4]);
		var m5 = d * (this.matrix[1] * this.matrix[4] - this.matrix[0] * this.matrix[5]);
		this.matrix[0] = m0;
		this.matrix[1] = m1;
		this.matrix[2] = m2;
		this.matrix[3] = m3;
		this.matrix[4] = m4;
		this.matrix[5] = m5;
		this.setTransform();
	};
	
	//==========================================
	// Helpers
	//==========================================
	
	transformPoint(x, y) {
		console.log(`Transform Helpers transformPoint`);
		return {
			x: x * this.matrix[0] + y * this.matrix[2] + this.matrix[4],
			y: x * this.matrix[1] + y * this.matrix[3] + this.matrix[5]
		};
	};
}

// can't get CommonJS working right now
//exports.Transform = Transform;