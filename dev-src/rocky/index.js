let rocky = require('rocky');

//For calcuating the framerate
//TODO make a sweeping seconds hand app and get it do get to 30FPS
//TODO make a new class that simply calculates the ms between calls. Use as speed optimizer
class FPS {
	
	constructor() {
		this.fps            = 0;
		this.lastCalledTime = null;
		this.delta          = null;
	}
	
	get() {
		this.delta          = (Date.now() - lastCalledTime || 1) / 1000;
		this.lastCalledTime = Date.now();
		this.fps            = Math.floor(1 / delta);
		return this.fps;
	}
}

class Watchapp {
	constructor() {
		this.initialized = false;
		this.appStartTime = new Date();
		this.timeElapsed = 0;
		this.interval = 10000;
	}
	
	//Fresh canvas
	clear() {
		this.ctx.clearRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
	}
	draw(ctx) {
		this.ctx = ctx;
		
		//.log(new Date().toLocaleDateString('en-US', {month: 'long'}));
		//this.ctx.translate(20, 20);
		
		this.time = new Date()
		this.timeElapsed = this.time - this.appStartTime;
		//console.log(`timeElapsed ${this.timeElapsed}`);
		this.clear();
		
		if (!this.initialized) {
			//Calculate some things that we don't want to keep calculating
			this.dimensions  = {
				w: this.ctx.canvas.unobstructedWidth,
				h: this.ctx.canvas.unobstructedHeight
			};
			
			this.center = {
				x: this.dimensions.w / 2,
				y: this.dimensions.h / 2
			}
			
			this.outerRadius = this.dimensions.w / 2;
			
			//Platform checking
			this.isRound = (this.dimensions.w === 180);
			
			
			this.initialized = true;
		}
		//Checks that can change between draws.
		this.isQuickViewOpen = (this.ctx.canvas.unobstructedHeight < this.ctx.canvas.clientHeight);
		
		this.ctx.scale(.5, .5);
		this.ctx.strokeStyle = 'white';
		this.ctx.lineWidth = 8;
	
		this.ctx.beginPath();
		this.ctx.moveTo(this.center.x, this.center.y);
		this.ctx.lineTo(this.center.x, this.center.y - (this.outerRadius - 10));
		ctx.stroke();
		
		
		
		
	}
}

let watchapp = new Watchapp();
rocky.on('draw', (event)=> {
	
	let ctx = event.context;
	//BEGIN TRANSFORM CODE
	//Shamelessly copied from https://gist.githubusercontent.com/abicky/3165385/raw/8afaa0683ec0a410fda9ae96e21bb7464ac42498/canvas_get_transform.js
	ctx._transform = [1, 0, 0, 1, 0, 0];
	ctx._transforms = [];
	
	ctx.getTransform = function() {
		return this._transform;
	};
	
	var restore = ctx.restore;
	ctx.restore = function() {
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
	var rotate = ctx.rotate;
	ctx._rotate = function(angle) {
		var t = [Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0];
		this._transform = multiplyTransform(this._transform, t);
		rotate.apply(this, arguments);
	};
	
	var save = ctx.save;
	ctx.save = function() {
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
	var scale = ctx.scale;
	ctx.scale = function(sx, sy) {
		console.log('We are in the scale method.');
		//This sometimes causes an app fault?
		this._transform = multiplyTransform(this._transform, [sx, 0, 0, sy, 0, 0]);
		console.log('we did the multiplyTransform. Now what?');
		console.log('Manually edit every method? What about members like lineWidth?');
		
	};
	
	var lineTo
	
	var setTransform = ctx.setTransform;
	ctx.setTransform = function(a, b, c, d, e, f) {
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
	var translate = ctx.translate;
	ctx.translate = function(tx, ty) {
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
	var transform = ctx.transform;
	ctx.transform = function(a, b, c, d, e, f) {
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
	
	//END TRANSFORM CODE
	
	watchapp.draw(ctx);
	
	
	console.log('We are about to start the draw interval. Hold on to your butts.');
	setTimeout(()=> {
		rocky.requestDraw();
	}, watchapp.interval);
});
