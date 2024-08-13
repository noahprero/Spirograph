const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;


const trail_canvas = document.getElementById("trail-canvas");
const trail_ctx = trail_canvas.getContext("2d");
trail_canvas.width = window.innerWidth * 0.8;
trail_canvas.height = window.innerHeight * 0.8;
trail_ctx.globalAlpha = 0.3;

const rotation_canvas = document.getElementById("rotation-canvas");
const rotation_ctx = rotation_canvas.getContext("2d");
rotation_canvas.width = window.innerWidth * 0.8;
rotation_canvas.height = window.innerHeight * 0.8;

const visual_toggle_circles = document.getElementById("visual-toggle-circles");
const visual_toggle_trail = document.getElementById("visual-toggle-trail");
const visual_toggle_rotations = document.getElementById("visual-toggle-rotations");
const circle_count_input = document.getElementById("circle-count");
const base_radius_input = document.getElementById("base-circle-radius");
const size_change_slider = document.getElementById("size-change");


window.addEventListener('resize', function() {
    resizeCanvases(0.8);

    // Recenter base circle
    base_circle.setPos(canvas.width / 2, canvas.height/2);

    prev_tip_x = 0;
    prev_tip_y = 0;

    trail_ctx.globalAlpha = 0.3;
});


circle_count_input.addEventListener(('change'), function() {
    // Change amount of circles then reinitialize the array
    circle_count = this.value;
    base_circle = initialize_circle_array();
});


base_radius_input.addEventListener(('change'), function() {
    base_circle.setRadius(parseInt(this.value));
    base_radius = parseInt(this.value);
    base_circle = initialize_circle_array();
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
    if(this.checked) {
        draw_trail = true;
    }
    else{
        // Reset tip position to avoid drawing incorrect lines
        prev_tip_x = 0;
        prev_tip_y = 0;

        draw_trail = false;
    }
});


visual_toggle_rotations.addEventListener(("change"), function() {
    clearCanvas(rotation_ctx, rotation_canvas);
    if(this.checked) {
        draw_rotations = true;
    }
    else {
        draw_rotations = false;
    }
});


class Circle {
    constructor(ctx, x, y, r, angle, speed) {
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


function resizeCanvases(percentage){
    let width = window.innerWidth * percentage;
    let height = window.innerHeight * percentage;

    canvas.width = width;
    canvas.height = height;

    trail_canvas.width = width;
    trail_canvas.height = height;

    rotation_canvas.width = width;
    rotation_canvas.height = height;
}


function clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function clearCanvasAll() {
    clearCanvas(ctx, canvas);
    clearCanvas(trail_ctx, trail_canvas);
    clearCanvas(rotation_ctx, rotation_canvas);
}


function initialize_circle_array() {
    // Reset
    clearCanvasAll();
    prev_tip_x = 0;
    prev_tip_y = 0;

    circles = [];
    // Base circle
    let base_circle = new Circle(ctx, canvas.width / 2, canvas.height / 2, base_radius, 0, 0);

    // Add base circle and then remaining circles with random speeds to array
    circles.push(base_circle);

    for(let i = 1; i < circle_count; i ++) {
        circles.push(new Circle(ctx, 1, 1, 1, 0, (Math.random() * 2 - 1) * speed_multiplier));
        //circles.push(new Circle(ctx, 1, 1, 1, 0, Math.pow(-4, i) / 100));  // Fractal formula
    }
    return base_circle;
}


// Main
let base_radius = parseInt(base_radius_input.value);
let draw_circles = visual_toggle_circles.checked;
let draw_trail = visual_toggle_trail.checked;
let draw_rotations = visual_toggle_rotations.checked;
let circles = [];
let circle_count = circle_count_input.value;
let size_change = size_change_slider.value;  // Size of each circle relative to the previous circle
let speed_multiplier = 0.06  // Value to multiply the initial random speed by

// Keep track of the previous tip circle position to draw lines making up the trail
let prev_tip_x = 0;
let prev_tip_y = 0;

base_circle = initialize_circle_array();

function animate() {
    
    if(draw_circles) {
        clearCanvas(ctx, canvas);
        base_circle.draw();
    }

    if(draw_rotations) {
        clearCanvas(rotation_ctx, rotation_canvas);
    }

    radius = base_radius;

    // Calculate each circle's new position 
    for (let i = 1; i < circle_count; i++) {
        radius *= size_change;
        radius_sum = radius + circles[i-1].r;
        
        let x = circles[i-1].x + radius_sum * Math.cos(circles[i].angle);
        let y = circles[i-1].y + radius_sum * Math.sin(circles[i].angle);

        circles[i].setPos(x, y);
        circles[i].setRadius(radius);
        
        if(draw_circles){
            circles[i].draw();
        }

        if(draw_rotations) {
            
            rotation_ctx.beginPath();
            rotation_ctx.moveTo(circles[i-1].x, circles[i-1].y);
            rotation_ctx.lineTo(x, y);
            rotation_ctx.stroke();
        }
        
        if(i == circle_count - 1){
            if(draw_trail) {
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

        circles[i].angle += circles[i].speed;
    }

    
    requestAnimationFrame(animate);
}

animate();