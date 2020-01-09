function ShapeTool() {
    this.icon = "assets/shapes.png";
    this.name = "shapeTool";

    var shapes = ["Rectangle", "Triangle", "Circle"];
    var selectedShape = shapes[0];

    var state;
    
    this.draw = function() {
        if(mouseIsPressed) {
            // 1. starts drawing the shape
            if (state.x == -1 && state.y == -1) {
                state.x = mouseX;
                state.y = mouseY;
            } else {
                // 2. dragging the mouse
                state.w = mouseX - state.x;
                state.h = mouseY - state.y;
                // reset the canvas and draw the new shape
                updatePixels();
                if (selectedShape == "Rectangle") {
                    rect(state.x, state.y, state.w, state.h);
                } else if (selectedShape == "Triangle") {
                    // equiateral triangle around the initial point
                    // x1, y1 = state.x, state.y - state.h
                    // y2, y3 = state.h + state.y
                    // x2 = state.x - state.w
                    // x3 = state.x + state.w
                    triangle(state.x, state.y - state.h, 
                        state.x - state.w, state.y + state.h, 
                        state.x + state.w, state.y + state.h);
                } else if (selectedShape == "Circle") {
                    // circle around x, y with radius = max(width, height)
                    ellipse(state.x, state.y, Math.max(state.w, state.h) * 2.0);
                }
            }
        } else {
            // 3. let go mouse so stop drawing
            if (state.x != -1) {
                resetState();
                // save the copy of image in memory permenantly
                loadPixels();
            }
        }
    }

    this.unselectTool = function() {
        select(".options").html("");
    }

    this.populateOptions = function() {
        let shapeSelect = createSelect();
        for(let i=0; i<shapes.length; i++) {
            shapeSelect.option(shapes[i]);
        }
        shapeSelect.parent(select(".options"));
        shapeSelect.changed(()=> {
            selectedShape = shapeSelect.value();
        });
    }

    let resetState = function() {
        state = {
            x: -1, 
            y: -1,
            w: -1,
            h: -1
        }
    }
    resetState();
}