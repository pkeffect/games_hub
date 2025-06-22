function drawHatchedRoundRect({ ctx, position, width, height, radius, color, spacing = 3, hasStroke = true, type = 'vertical' }) {
    ctx.beginPath();
    ctx.roundRect(position.x, position.y, width, height, radius);
    ctx.save();
    ctx.clip();

    // Add stroke to the rounded rectangle
    if(hasStroke) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Draw hatching lines
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    for (let i = 0; i < width; i += spacing) {
        ctx.beginPath();

        switch (type) {
        case 'horizontal':
            ctx.moveTo(position.x, position.y + i);
            ctx.lineTo(position.x + width, position.y + i);
            break;
        case 'vertical':
            ctx.moveTo(position.x + i, position.y);
            ctx.lineTo(position.x + i, position.y + height);
            break;
        case 'diagonal':
            ctx.moveTo(position.x + i, position.y);
            ctx.lineTo(position.x + i + height, position.y + height);
            break;
        default:
            break;
        }

        ctx.stroke();
    }

    ctx.restore();
}


export { drawHatchedRoundRect };
