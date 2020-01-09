function AutoDrawTool(stencils) {
    this.icon = "assets/autodraw.png";
    this.name = "autoDrawTool";

    const maxIcons = 20;

    let myStencils = stencils;
    let previousMouseX, previousMouseY, pressedAt;
    let currentShape;

    let suggestionDiv;
    let shapeBBox;

    loadPixels();

    // todo: handle multiple shapes

	this.draw = function(){
        //if the mouse is pressed inside the canvas
        const mouseIsPressedInCanvas = mouseIsPressed && 
            mouseX > 0 && mouseX < width && 
            mouseY > 0 && mouseY < height;
		if(mouseIsPressedInCanvas){
			//check if they previousX and Y are -1. set them to the current
			//mouse X and Y if they are.
			if (previousMouseX == -1){
				previousMouseX = mouseX;
                previousMouseY = mouseY;
                pressedAt = Date.now();
			}
			//if we already have values for previousX and Y we can draw a line from 
			//there to the current mouse location
			else {
                currentShape[0].push(previousMouseX);
                currentShape[1].push(previousMouseY);
                currentShape[2].push(Date.now() - pressedAt);
				line(previousMouseX, previousMouseY, mouseX, mouseY);
				previousMouseX = mouseX;
				previousMouseY = mouseY;
			}
		}
		//if the user has released the mouse we want to set the previousMouse values 
		//back to -1.
		//try and comment out these lines and see what happens!
		else if (previousMouseX != -1) {
            shapeBBox = getBBoxFromShape(currentShape);
            sendRequest(currentShape, processApiData);
			resetShape();
        }
    };

    this.unselectTool = function() {
        select(".options").html("");
    }

    this.populateOptions = function() {
        suggestionDiv = createDiv();
        suggestionDiv.parent(select(".options"));
        suggestionDiv.id('suggestions');
    }
    
    let resetShape = function() {
        previousMouseX = -1;
        previousMouseY = -1;
        pressedAt = -1;

        currentShape = [
            [], // x coods
            [], // y coods
            []  // times
        ];
    }

    let sendRequest = function(shapes, resultCallback) {
        // todo: error handling for failed calls
        const url = 'https://inputtools.google.com/request?ime=handwriting&app=autodraw&dbg=1&cs=1&oe=UTF-8';
        const options = {
            "input_type" : 0,
            "requests" : [
                {
                    "language" : "autodraw",
                    "writing_guide" : {"width" : width, "height" : height},
                    "ink" : [shapes]
                }
            ]
        };
        httpPost(
            url,
            'json',
            options,   
            resultCallback
        );
    }

    let processApiData = function(response) {
        try {
            data = JSON.parse(response[1][0][3].debug_info.match(/SCORESINKS: (.*) Service_Recognize:/)[1]).map(
                result => {
                    return {
                        name: result[0],
                        icons: (myStencils[result[0]] || []).map(x => x.src)
                    }
                }
            );
            setSuggestions(data);
        } catch (err) {
            resetSuggestions();
            console.log(err);
        }
    }

    let setSuggestions = function(suggestions) {
        resetSuggestions();
        let iconCount = 0;
        // iterate over suggestion
        for(let i=0; i < suggestions.length; i++) {
            // iterate over all icons in suggestion
            for(let j=0; j < suggestions[i].icons.length; j++) {
                // create an image element with callback
                const iconUrl = suggestions[i].icons[j];
                const imgElement = createImg(iconUrl, suggestions[i].name);
                imgElement.size(50, 50);
                imgElement.class('suggested-img');
                imgElement.parent(suggestionDiv);
                imgElement.mouseClicked(suggestionClicked);
                iconCount++;
                if(iconCount > maxIcons) return;
            }
        }
    }

    let resetSuggestions = function() {
        suggestionDiv.html('');
    }

    let suggestionClicked = function(clickEvent) {
        const imageElement = clickEvent.srcElement;
        console.log(imageElement);
        updatePixels(); // get rid of the image
        // get image from URL
        loadImage(imageElement.src, img => {
            image(img, shapeBBox.x, shapeBBox.y, shapeBBox.w, shapeBBox.h);
        });
    }

    let getBBoxFromShape = function(shape) {
        x_min = Math.min(...shape[0]);
        x_max = Math.max(...shape[0]);
        y_min = Math.min(...shape[1]);
        y_max = Math.max(...shape[1]);
        return {
            x: x_min,
            y: y_min,
            w: x_max - x_min,
            h: y_max - y_min
        };
    }

    resetShape();
}
