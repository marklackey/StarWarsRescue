// Frank Poth 10/03/2017

var Button, controller, display;

let arrowU = new Image();
arrowU.src = "assets/arrow.png";
let arrowD = new Image();
arrowD.src = "assets/arrowD.png";
let arrowR = new Image();
arrowR.src = "assets/arrowR.png";
let arrowL = new Image();
arrowL.src = "assets/arrowL.png";
// basically a rectangle, but it's purpose here is to be a button:
Button = function(x, y, width, height, color, name) {

    this.active = false;
    this.color = color;
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
    this.name = name;

}

Button.prototype = {

    // returns true if the specified point lies within the rectangle:
    containsPoint: function(x, y) {

        // if the point is outside of the rectangle return false:
        if (x < this.x || x > this.x + this.width || y < this.y || y > this.y + this.width) {

            return false;

        }

        return true;

    }

};

// handles everything to do with user input:
controller = {

    buttons: [

        // new Button(0, 10, 60, 60, "#f09000"),
        new Button(5, 5, 30, 30, "#0090f0", "left"),
        new Button(40, 5, 30, 30, "#0090f0", "right"),
        new Button(75, 5, 30, 30, "#0090f0", "up"),
        new Button(110, 5, 30, 30, "#0090f0", "down")
    ],

    testButtons: function(target_touches) {

        var button, index0, index1, touch;

        // loop through all buttons:
        for (index0 = this.buttons.length - 1; index0 > -1; --index0) {

            button = this.buttons[index0];
            button.active = false;

            // loop through all touch objects:
            for (index1 = target_touches.length - 1; index1 > -1; --index1) {

                touch = target_touches[index1];

                // make sure the touch coordinates are adjusted for both the canvas offset and the scale ratio of the buffer and output canvases:
                if (button.containsPoint((touch.clientX - display.bounding_rectangle.left) * display.buffer_output_ratio, (touch.clientY - display.bounding_rectangle.top) * display.buffer_output_ratio)) {

                    button.active = true;

                    break; // once the button is active, there's no need to check if any other points are inside, so continue

                }

            }
            if (GAME_STARTED) {
                if (button.name === "left") {
                    if (button.active) {
                        doLeft();
                    } else { stopLeft(); }
                }
                if (button.name === "right") {
                    if (button.active) {
                        doRight();
                    } else { stopRight(); }
                }
                if (button.name === "up") {
                    if (button.active) {
                        doUp();
                    } else { stopUp(); }
                }
                if (button.name === "down") {
                    if (button.active) {
                        doDown();
                    } else { stopDown(); }
                }
            } else {
                GAME_STARTED = true;
            }
        }

    },

    touchEnd: function(event) {

        event.preventDefault();
        controller.testButtons(event.targetTouches);

    },

    touchMove: function(event) {

        event.preventDefault();
        controller.testButtons(event.targetTouches);

    },

    touchStart: function(event) {

        event.preventDefault();
        controller.testButtons(event.targetTouches);

    }

};

// handles everything to do with displaying graphics on the screen:
display = {

    // the buffer is used to scale the applications graphics to fit the screen:
    buffer: document.createElement("canvas").getContext("2d"),
    // the on screen canvas context that we will be drawing to:
    output: document.querySelector("#canvas2").getContext("2d"),
    // the p element for text output:
    message: document.querySelector("p"),


    // the ratio in size between the buffer and output canvases used to scale user input coordinates:
    buffer_output_ratio: 1,
    // the bounding rectangle of the output canvas used to determine the location of user input on the output canvas:
    bounding_rectangle: undefined,


    // renders the buffer to the output canvas:
    render: function() {
        ctx.globalAlpha = .7;
        ctx.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height,
            canvas.width - this.output.canvas.width - 10, canvas.height - this.output.canvas.height - 10, this.output.canvas.width, this.output.canvas.height);
        ctx.globalAlpha = 1;
    },

    // renders the buttons:
    renderButtons: function(buttons) {

        var button, index;

        this.buffer.fillStyle = "#202830";
        this.buffer.fillRect(0, 0, this.buffer.canvas.width, this.buffer.canvas.height);

        button = buttons[0];
        this.buffer.drawImage(arrowL, buttons[0].x, buttons[0].y, buttons[0].width, buttons[0].height);
        button = buttons[1];
        this.buffer.drawImage(arrowR, buttons[1].x, buttons[1].y, buttons[1].width, buttons[1].height);
        button = buttons[2];
        this.buffer.drawImage(arrowU, buttons[2].x, buttons[2].y, buttons[2].width, buttons[2].height);
        button = buttons[3];
        this.buffer.drawImage(arrowD, buttons[3].x, buttons[3].y, buttons[3].width, buttons[3].height);
    },

    // just keeps the output canvas element sized appropriately:
    resize: function(event) {

        display.output.canvas.width = Math.floor(document.documentElement.clientWidth - 32);

        if (display.output.canvas.width > document.documentElement.clientHeight) {

            display.output.canvas.width = .4 * Math.floor(document.documentElement.clientWidth);

        }

        display.output.canvas.height = Math.floor(display.output.canvas.width * 0.27);

        // these next two lines are used for adjusting and scaling user touch input coordinates:
        display.bounding_rectangle = display.output.canvas.getBoundingClientRect();

        display.buffer_output_ratio = display.buffer.canvas.width / display.output.canvas.width;

    }

};

// initialize the application

// size the buffer:
display.buffer.canvas.height = 40;
display.buffer.canvas.width = 150;

window.addEventListener("resize", display.resize);
// setting passive:false allows you to use preventDefault in event listeners:
display.output.canvas.addEventListener("touchend", controller.touchEnd, { passive: false });
display.output.canvas.addEventListener("touchmove", controller.touchMove, { passive: false });
display.output.canvas.addEventListener("touchstart", controller.touchStart, { passive: false });

// make sure the display canvas is the appropriate size on the screen:
display.resize();