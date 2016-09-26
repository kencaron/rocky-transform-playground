/**
 * Shamelessly copied from https://gist.githubusercontent.com/abicky/3165385/raw/8afaa0683ec0a410fda9ae96e21bb7464ac42498/canvas_get_transform.js
 * Copyright 2012- Takeshi Arabiki
 * License: MIT License (http://opensource.org/licenses/MIT)
 */

(function(CanvasRenderingContext2D) {
	CanvasRenderingContext2D._transform = [1, 0, 0, 1, 0, 0];
	CanvasRenderingContext2D._transforms = [];
	
	CanvasRenderingContext2D.getTransform = function() {
		return this._transform;
	};
	
	var restore = CanvasRenderingContext2D.restore;
	CanvasRenderingContext2D.restore = function() {
		this._transform = this._transforms.pop() || [1, 0, 0, 1, 0, 0];
		restore.apply(this);
	};
	
	// |   |   |                            | |   |
	// | x'|   | cos(angle)  -sin(angle)  0 | | x |
	// |   |   |                            | |   |
	// | y'| = | sin(angle)   cos(angle)  0 | | y |
	// |   |   |                            | |   |
	// | 1 |   |     0             0      1 | | 1 |
	// |   |   |                            | |   |
	var rotate = CanvasRenderingContext2D.rotate;
	CanvasRenderingContext2D.rotate = function(angle) {
		var t = [Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0];
		this._transform = multiplyTransform(this._transform, t);
		rotate.apply(this, arguments);
	};
	
	var save = CanvasRenderingContext2D.save;
	CanvasRenderingContext2D.save = function() {
		this._transforms.push(this._transform.slice());
		save.apply(this);
	};
	
	// |   |   |         | |   |
	// | x'|   | sx 0  0 | | x |
	// |   |   |         | |   |
	// | y'| = | 0  sy 0 | | y |
	// |   |   |         | |   |
	// | 1 |   | 0  0  1 | | 1 |
	// |   |   |         | |   |
	var scale = CanvasRenderingContext2D.scale;
	CanvasRenderingContext2D.scale = function(sx, sy) {
		this._transform = multiplyTransform(this._transform, [sx, 0, 0, sy, 0, 0]);
		scale.apply(this, arguments);
	};
	
	var setTransform = CanvasRenderingContext2D.setTransform;
	CanvasRenderingContext2D.setTransform = function(a, b, c, d, e, f) {
		this._transform = Array.slice.apply(arguments);
		setTransform.apply(this, arguments);
	};
	
	// |   |   |          | |   |
	// | x'|   | 1  0  tx | | x |
	// |   |   |          | |   |
	// | y'| = | 0  1  ty | | y |
	// |   |   |          | |   |
	// | 1 |   | 0  0  1  | | 1 |
	// |   |   |          | |   |
	var translate = CanvasRenderingContext2D.translate;
	CanvasRenderingContext2D.translate = function(tx, ty) {
		this._transform = multiplyTransform(this._transform, [1, 0, 0, 1, tx, ty]);
		translate.apply(this, arguments);
	};
	
	// |   |   |         | |   |
	// | x'|   | a  c  e | | x |
	// |   |   |         | |   |
	// | y'| = | b  d  f | | y |
	// |   |   |         | |   |
	// | 1 |   | 0  0  1 | | 1 |
	// |   |   |         | |   |
	var transform = CanvasRenderingContext2D.transform;
	CanvasRenderingContext2D.transform = function(a, b, c, d, e, f) {
		this._transform = multiplyTransform.call(this, this._transform, arguments);
		transform.apply(this, arguments);
	};
	
	// ctx.transform.apply(ctx, t1)
	// ctx.transform.apply(ctx, t2)
	// => ctx.transform.apply(ctx, multiplyTransform(t1, t2))
	var multiplyTransform = function(t1, t2) {
		return [
			t1[0] * t2[0] + t1[2] * t2[1],
			t1[1] * t2[0] + t1[3] * t2[1],
			t1[0] * t2[2] + t1[2] * t2[3],
			t1[1] * t2[2] + t1[3] * t2[3],
			t1[0] * t2[4] + t1[2] * t2[5] + t1[4],
			t1[1] * t2[4] + t1[3] * t2[5] + t1[5]
		];
	};
})();