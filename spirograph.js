const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const visual_toggle = document.getElementById("visual-toggle");
const circle_count_input = document.getElementById("circle-count");
const base_radius_input = document.getElementById("base-circle-radius");
const size_change_slider = document.getElementById("size-change");
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    // Recenter base circle
    base_circle.setPos(canvas.width / 2, canvas.height/2);

    prev_tip_x = 0;
    prev_tip_y = 0;
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
    console.log(size_change);
})


visual_toggle.addEventListener('change', function() {
    clearCanvas(ctx, canvas);
    if(this.checked){
        // Reset tip position to avoid drawing incorrect lines
        prev_tip_x = 0;
        prev_tip_y = 0;

        draw_circles = false;
    }
    else{
        draw_circles = true;
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
        ctx.lineWidth = 3;
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


function initialize_circle_array(){
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
let circles = [];
let circle_count = circle_count_input.value;
let size_change = 0.8;  // Size of each circle relative to the previous circle
let speed_multiplier = 0.1  // Value to multiply the initial random speed by


base_circle = initialize_circle_array();

// Keep track of the previous tip circle position to draw lines making up the trail
let prev_tip_x = 0;
let prev_tip_y = 0;

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
        
        if(i == circle_count - 1 && !draw_circles){
            if(prev_tip_x == 0 && prev_tip_y == 0){
                prev_tip_x = x;
                prev_tip_y = y;
            }
            ctx.beginPath();
            ctx.moveTo(prev_tip_x, prev_tip_y);
            ctx.lineTo(x, y);
            ctx.stroke();
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