
var TextureAnimator = window.TextureAnimator = function(texture, tilesHoriz, tilesVert) {
	// texture passed by reference, will be updated by the update function.

	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;

	this.texture = texture;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	// which image is currently being displayed?
	this._currentTile = this.currentTile = 0;

}

TextureAnimator.prototype.update = function() {
	var currentColumn = this._currentTile % this.tilesHorizontal;
	this.texture.offset.x = currentColumn / this.tilesHorizontal;
	var currentRow = Math.floor( this._currentTile / this.tilesHorizontal );
	this.texture.offset.y = ( - currentRow - 1 ) / this.tilesVertical;
};

Object.defineProperty(TextureAnimator.prototype, 'currentTile', {

	get: function() {
		return this._currentTile;
	},

	set: function(i) {

		this._currentTile = i;
		this.update();

		return this;

	}

});