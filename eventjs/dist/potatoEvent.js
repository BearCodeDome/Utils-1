
var ALL_EVENT = '__all__';


function PotatoEvent () {
	if (!this instanceof PotatoEvent) {
		return new PotatoEvent();
	}
	this._callbacks = {};  //存储绑定事件的名称（key）以及回调函数（value）
}


PotatoEvent.prototype.addListener = function(ev, callback) {
	this._callbacks[ev] = this._callbacks[ev] || [];
	this._callbacks[ev].push(callback);
	return this;
};

PotatoEvent.prototype.bind = PotatoEvent.prototype.addListener;
PotatoEvent.prototype.on = PotatoEvent.prototype.addListener;
PotatoEvent.prototype.subscribe = PotatoEvent.prototype.addListener;
PotatoEvent.prototype.bind = PotatoEvent.prototype.addListener;


PotatoEvent.prototype.headbind = function(ev,callback) {
	this._callbacks[ev] = this._callbacks[ev] || [];
	this._callbacks[ev].unshift(callback);
	return this;
};



PotatoEvent.prototype.removeListener = function(ev,callback) {
	var callbacks = this._callbacks;

	if (!ev) {
		this._callbacks = {};
	} else {
		if (!callback) {
			callbacks[ev] = [];
		} else {
			var list = callbacks[ev];
			if (list) {
				for (var i=0; i<list.length; i++) {
					if (callback === list[i]) {
						list[i] = null;
					}
				}
			}
		}
	}

	return this;
};
PotatoEvent.prototype.unbind = PotatoEvent.prototype.removeListener;

PotatoEvent.prototype.removeAllListener = function(ev) {
	this.ubbind(ev);
};


PotatoEvent.prototype.bindForAll = function(callback) {
	this.bind(ALL_EVENT,callback);
};

PotatoEvent.prototype.unbindForAll = function(callback) {
	this.unbind(ALL_EVENT,callback);
};



PotatoEvent.prototype.trigger = function(eventname,data) {
	var list, ev, callback, i, l;
	var both = 2;
	var calls = this._callbacks;

	while (both--) {
		ev = both ? eventname : ALL_EVENT;
		list = calls[ev];
		if (list) {
			for (i=0,l=list.length; i<l; i++) {
				if (!(callback = list[i])) {
					list.splice(i,1);
					i--;
					l--;
				} else {
					var args = [];
					var start = both ? 1 : 0;
					for (var j=start; j<arguments.length; j++) {
						args.push(arguments[j]);
					}
					callback.apply(this,args);
				}
			}
		}
	}
};

PotatoEvent.prototype.emit = PotatoEvent.prototype.trigger;
PotatoEvent.prototype.fire = PotatoEvent.prototype.trigger;


PotatoEvent.prototype.once = function(ev,callback) {
	var self = this;
	var wrapper = function() {
		callback.apply(self,arguments);
		self.unbind(ev,wrapper);
	}
	this.bind(ev,wrapper);
	return this;
};





