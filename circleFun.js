$(function(){
	/* Library Stuff (tm) */
	//A lambda (insofar as I understand it)
	Array.prototype.doLambda = function(lambda){
		for(var i = 0; i < this.length; i++){
			this[i] = lambda(this[i]);
		};
	};

	//Truncate a number
	function trunc(x) {
  		return x < 0 ? Math.ceil(x) : Math.floor(x);
	}

	//String format (inject into string)
	// First, checks if it isn't implemented yet.
	if (!String.prototype.format) {
  		String.prototype.format = function() {
    		var args = arguments;
    		return this.replace(/{(\d+)}/g, function(match, number) { 
      			return typeof args[number] != 'undefined' ? args[number] : match;
    		});
  		};
	}

	//spits out rgb string
	var rgbStringify = function(rgbArray){
		return "rgb({0},{1},{2})".format(rgbArray[0],rgbArray[1],rgbArray[2]);
	};

	//spits out random rgb string
	var randomRgbString = function(){
		return rgbStringify([randomNumber(0,255), randomNumber(0,255), randomNumber(0,255)]);
	}

	//random number [min,max]
	var randomNumber = function(min, max){
		return Math.random() * ((max - min) + 1) + min;
	};

	/* Raphael stuff */
	(function(){
		//Paper dimensions object
		var paperDimensions = {
			x: 10,
			y: 50,
			width: 500,
			height: 500
		};

		// Creates canvas 320 × 200 at 10, 50
		var paper = Raphael(paperDimensions.x, paperDimensions.y, paperDimensions.width, paperDimensions.height);

		var initialCircleRadius = 150;

		var initialCircleFill = randomRgbString();

		//Initial properties of parent circle
		var initialCircleProperties = {
			radius:initialCircleRadius,
			x:(paperDimensions.width - initialCircleRadius) / 2,
			y:(paperDimensions.height - initialCircleRadius) / 2,
			fill:initialCircleFill
		};

		//variable to track functionality injection
		var hasInjectedPropterty = false;

		// Creates a new circle and appends it to svg dom
		var makeNewCircle = function(circleProperties){
			// Creates circle
			var circle = paper.circle(0, 0, circleProperties.radius);

			if(!hasInjectedPropterty){
				Object.getPrototypeOf(circle).makeDaugherCells = function(){
					var daughterCellsRadius = this.circleProperties.radius / 2;

					if(trunc(randomNumber(0,1)) === 1){
						var firstDaugterCellEventualAttributes = {
							radius:daughterCellsRadius,
							//add or subtract daughterCellsRadius from x
							x:this.circleProperties.x - daughterCellsRadius,
							y:this.circleProperties.y
						};

						var secondDaughterCellEventualAttributes = {
							radius:daughterCellsRadius,
							//add or subtract daughterCellsRadius from x
							x:this.circleProperties.x + daughterCellsRadius,
							y:this.circleProperties.y
						};
					}
					else{
						var firstDaugterCellEventualAttributes = {
							radius:daughterCellsRadius,
							//add or subtract daughterCellsRadius from x
							x:this.circleProperties.x,
							y:this.circleProperties.y - daughterCellsRadius
						};

						var secondDaughterCellEventualAttributes = {
							radius:daughterCellsRadius,
							//add or subtract daughterCellsRadius from x
							x:this.circleProperties.x,
							y:this.circleProperties.y + daughterCellsRadius
						};
					}

					//add parent fill
					(function(){
						firstDaugterCellEventualAttributes.fill = randomRgbString();;
						secondDaughterCellEventualAttributes.fill = randomRgbString();
					})();

					var firstDaughterCell = makeNewCircle(this.circleProperties);

					var secondDaughterCell = makeNewCircle(this.circleProperties);

					//bind data to cells (uhhg make me a better api please)
					firstDaughterCell.circleProperties = firstDaugterCellEventualAttributes;
					secondDaughterCell.circleProperties = secondDaughterCellEventualAttributes;

					//array of two daughter cells (no multiple returns)
					var daughterCells = [firstDaughterCell,secondDaughterCell];

					//animate transition to eventual attributes
					var animateToEventualAttributes = function(daughterCell){
						daughterCell.animate({
							transform: ['t',daughterCell.circleProperties.x, daughterCell.circleProperties.y],
							r:daughterCellsRadius,
							fill:daughterCell.circleProperties.fill
						}, 1000);
					};

					//do animation to attrs
					for(var i = 0; i < daughterCells.length; i++){
						animateToEventualAttributes(daughterCells[i]);
					}

					this.daughterCells = daughterCells;
				};

				hasInjectedPropterty = true;
			}

			circle.circleProperties = circleProperties;

			// Position circle initally
			circle.attr({transform: ['t',circleProperties.x, circleProperties.y]});

			circle.attr({fill: circle.circleProperties.fill});

			circle.attr({stroke: "rgb(0,0,0)"});

			circle.click(function(){
				circle.makeDaugherCells();

				// get rid of parent
				circle.remove();
			});

			return circle;
		};

		// spawn parent circle
		makeNewCircle(initialCircleProperties);
	})();
});

