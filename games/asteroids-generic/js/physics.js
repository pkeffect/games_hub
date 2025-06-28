// js/physics.js

// In classic Asteroids, asteroids pass through each other
// Only collision detection needed is for bullets, player, and UFOs
export function handleAsteroidCollisions(asteroids) {
    // Classic Asteroids doesn't have asteroid-to-asteroid collisions
    // Asteroids simply pass through each other
    // This function is kept for potential future use but does nothing
    return;
}

// Utility function for distance-based collision detection
export function checkCircleCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.radius + obj2.radius);
}

// Utility function for more precise collision detection if needed
export function checkPolygonCollision(vertices1, vertices2) {
    // Simple SAT (Separating Axis Theorem) implementation
    // This could be used for more precise ship collisions if desired
    // For now, we'll stick with circle collisions for simplicity
    return false;
}