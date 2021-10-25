var controller, display;

let arrowU = new Image();
arrowU.src = "assets/arrowU.png";
let arrowD = new Image();
arrowD.src = "assets/arrowD.png";
let arrowR = new Image();
arrowR.src = "assets/arrowR.png";
let arrowL = new Image();
arrowL.src = "assets/arrowL.png";

class Button {
    constructor(x, y, width, height, color, name) {
        this.active = false;
        this.color = color;
        this.height = height;
        this.width = width;
        this.x = x;
        this.y = y;
        this.name = name;
    }
    containsPoint(x, y) {
        // if the point is outside of the rectangle return false:
        if (x < this.x || x > this.x + this.width || y < this.y || y > this.y + this.width) {
            return false;
        }
        return true;
    }
}


// handles everything to do with user input:
controller = {

    buttons: [

        new Button(5, 5, 30, 30, "#0090f0", LEFT),
        new Button(40, 5, 30, 30, "#0090f0", RIGHT),
        new Button(75, 5, 30, 30, "#0090f0", UP),
        new Button(110, 5, 30, 30, "#0090f0", DOWN)
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
                if (button.containsPoint((touch.clientX - display.bounding_rectangle.left) * display.buffer_output_ratio,
                        (touch.clientY - display.bounding_rectangle.top) * display.buffer_output_ratio)) {
                    button.active = true;
                    break; // once the button is active, there's no need to check if any other points are inside, so continue
                }
            }
            if (GAME_STARTED) {
                moveOrStop(button.name, button.active);
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

    // the ratio in size between the buffer and output canvases used to scale user input coordinates:
    buffer_output_ratio: 1,
    // the bounding rectangle of the output canvas used to determine the location of user input on the output canvas:
    bounding_rectangle: undefined,

    // renders the buffer to the output canvas:
    render: function() {
        let bufferC = this.buffer.canvas;
        let outputC = this.output.canvas;
        ctx.globalAlpha = .7;
        ctx.drawImage(bufferC, 0, 0, bufferC.width, bufferC.height,
            canvas.width - outputC.width - 10, canvas.height - outputC.height - 10,
            outputC.width, outputC.height);
        ctx.globalAlpha = 1;
    },

    // renders the buttons:
    renderButtons: function(buttons) {
        var button, index;

        this.buffer.roundRect(0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 10);
        this.buffer.fillStyle = "#202830";
        ctx.fill();

        display.renderButton(buttons[0], arrowL)
        display.renderButton(buttons[1], arrowR)
        display.renderButton(buttons[2], arrowU)
        display.renderButton(buttons[3], arrowD)
    },
    renderButton: function(button, arrow) {
        this.buffer.drawImage(arrow, button.x, button.y, button.width, button.height);
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

// size the buffer:
display.buffer.canvas.height = 40;
display.buffer.canvas.width = 150;

// setting passive:false allows you to use preventDefault in event listeners:
display.output.canvas.addEventListener("touchend", controller.touchEnd, { passive: false });
display.output.canvas.addEventListener("touchmove", controller.touchMove, { passive: false });
display.output.canvas.addEventListener("touchstart", controller.touchStart, { passive: false });

// make sure the display canvas is the appropriate size on the screen:
display.resize();