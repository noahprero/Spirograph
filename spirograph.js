const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;
ctx.globalAlpha = 0.3;

const trail_canvas = document.getElementById("trail-canvas");
const trail_ctx = trail_canvas.getContext("2d");
trail_canvas.width = window.innerWidth * 0.8;
trail_canvas.height = window.innerHeight * 0.8;

const visual_toggle_circles = document.getElementById("visual-toggle-circles");
const visual_toggle_trail = document.getElementById("visual-toggle-trail");
const circle_count_input = document.getElementById("circle-count");
const base_radius_input = document.getElementById("base-circle-radius");
const size_change_slider = document.getElementById("size-change");


window.addEventListener('resize', function() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    // Recenter base circle
    base_circle.setPos(canvas.width / 2, canvas.height/2);
    
    prev_tip_x = 0;
    prev_tip_y = 0;

    ctx.globalAlpha = 0.3;
});


circle_count_input.addEventListener(('change'), function() {
    // Change amount of circles then reinitialize the array
    circle_count = this.value;
    initialize_circle_array();
});


base_radius_input.addEventListener(('change'), function() {
    base_circle.setRadius(parseInt(this.value));
    initialize_circle_array();
});


size_change_slider.addEventListener(('change'), function() {
    size_change = this.value;
})


visual_toggle_circles.addEventListener('change', function() {
    clearCanvas(ctx, canvas);
    if(this.checked){
        draw_circles = true;
    }
    else{
        draw_circles = false;
    }
});


visual_toggle_trail.addEventListener(("change"), function() {
    clearCanvas(trail_ctx, trail_canvas);
    if(this.checked){
        draw_trail = true;
    }
    else{
        // Reset tip position to avoid drawing incorrect lines
        prev_tip_x = 0;
        prev_tip_y = 0;

        draw_trail = false;
    }
});


class Circle {
    constructor(ctx, x, y, r, angle, speed){
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.r = r;
        this.angle = angle;
        this.speed = speed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();
    }

    setPos(new_x, new_y) {
        this.x = new_x;
        this.y = new_y;
    }
    
    setRadius(new_radius) {
        this.r = new_radius;
    }
}


function clearCanvas(ctx, canvas){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function clearCanvasAll() {
    clearCanvas(ctx, canvas);
    clearCanvas(trail_ctx, trail_canvas);
}


function initialize_circle_array(){
    // Reset
    clearCanvasAll();
    prev_tip_x = 0;
    prev_tip_y = 0;

    circles = [];
    // Base circle
    let base_circle = new Circle(ctx, canvas.width / 2, canvas.height / 2, base_radius, 0, null);

    // Add base circle and then remaining circles with random speeds to array
    circles.push(base_circle);
    for(let i = 1; i < circle_count; i ++){
        circles.push(new Circle(ctx, 1, 1, 1, 0, (Math.random() * 2 - 1) * speed_multiplier));
    }
    return base_circle;
}


// Main
let base_radius = parseInt(base_radius_input.value);
let draw_circles = true;
let draw_trail = false;
let circles = [];
let circle_count = circle_count_input.value;
let size_change = 0.8;  // Size of each circle relative to the previous circle
let speed_multiplier = 0.04  // Value to multiply the initial random speed by

// Keep track of the previous tip circle position to draw lines making up the trail
let prev_tip_x = 0;
let prev_tip_y = 0;

base_circle = initialize_circle_array();

function animate() {
    if(draw_circles){
        clearCanvas(ctx, canvas);
        base_circle.draw();
    }

    radius = parseInt(base_radius_input.value);
    let prev_x = base_circle.x;
    let prev_y = base_circle.y;
    let prev_radius = base_circle.r;

    // Calculate each circle's new position 
    for (let i = 1; i < circle_count; i++) {
        radius *= size_change;
        radius_sum = radius + prev_radius;
        let x = prev_x + radius_sum * Math.cos(circles[i].angle);
        let y = prev_y + radius_sum * Math.sin(circles[i].angle);
        circles[i].setPos(x, y);
        circles[i].setRadius(radius);
        if(draw_circles){
            circles[i].draw();
        }
        
        if(i == circle_count - 1){
            if(draw_trail){
                if(prev_tip_x == 0 && prev_tip_y == 0){
                    prev_tip_x = x;
                    prev_tip_y = y;
                }
                trail_ctx.beginPath();
                trail_ctx.moveTo(x, y);
                trail_ctx.lineTo(prev_tip_x, prev_tip_y);
                trail_ctx.stroke();
            }
            prev_tip_x = x;
            prev_tip_y = y;
        }

        prev_radius = radius;
        prev_x = x;
        prev_y = y;

        circles[i].angle += circles[i].speed;
    }

    
    requestAnimationFrame(animate);
}

animate();