#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;
uniform sampler2D u_mask;
uniform sampler2D u_noise;
uniform vec2 u_size;
uniform vec2 u_noiseOffset;

varying vec4 v_color;
varying vec2 v_texCoord;

const float pixelMargin = 10.;
const vec4 borderColor = vec4(0.2, .2, .1, 1.);
const float borderThickness = .2;


float cubicPulse( float c, float w, float x )
{
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}


void main() {
    vec2 invertedY = vec2(v_texCoord.x, 1. - v_texCoord.y);

    vec4 covered = texture2D(u_texture, v_texCoord);
    vec4 clear = vec4(0,0,0,0);
    float noise = texture2D(u_noise, (v_texCoord + u_noiseOffset) * 2.).r;
    noise = (noise +  texture2D(u_noise, (v_texCoord + u_noiseOffset) * 4.).g) / 2.;
    noise = noise * 2. - 1.;

    vec2 scaledMargin = pixelMargin/u_size;
    float count = 9.;

    vec4 mask = texture2D(u_mask, invertedY) /count;
    mask = mask + texture2D(u_mask, vec2(invertedY.x + scaledMargin.x, invertedY.y + scaledMargin.y)) / count;
    mask = mask + texture2D(u_mask, vec2(invertedY.x + scaledMargin.x, invertedY.y - scaledMargin.y)) / count;
    mask = mask + texture2D(u_mask, vec2(invertedY.x - scaledMargin.x, invertedY.y - scaledMargin.y)) / count;
    mask = mask + texture2D(u_mask, vec2(invertedY.x - scaledMargin.x, invertedY.y + scaledMargin.y)) / count;

    mask = mask + texture2D(u_mask, vec2(invertedY.x + scaledMargin.x *.5, invertedY.y + scaledMargin.y * .5)) / count;
    mask = mask + texture2D(u_mask, vec2(invertedY.x + scaledMargin.x *.5, invertedY.y - scaledMargin.y *.5)) / count;
    mask = mask + texture2D(u_mask, vec2(invertedY.x - scaledMargin.x *.5, invertedY.y - scaledMargin.y *.5)) / count;
    mask = mask + texture2D(u_mask, vec2(invertedY.x - scaledMargin.x *.5, invertedY.y + scaledMargin.y *.5)) / count;


    float noiseAddition = cubicPulse(.5, .45, mask.r);
//    xray.r = noiseAddition;
    float mixAmount = smoothstep(.2, .8, mask.r + (noiseAddition * noise));
    vec4 finalColor = mix(covered, borderColor, smoothstep(.5 - borderThickness, .45, mixAmount)) ;
    finalColor = mix(finalColor, clear, smoothstep(.55, .5 +borderThickness, mixAmount));

    gl_FragColor = finalColor * v_color;
}
