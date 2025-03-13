#version 120

varying vec2 vTexCoord;
varying vec4 vColor;
varying vec3 vNormal;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float galaxyDensity = 2.5;
uniform float starBrightness = 0.8;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
    );
    
    return n;
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 3.0;
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

float spiral(vec2 p, float arms, float tightness) {
    float angle = atan(p.y, p.x);
    float dist = length(p);
    float spiral = sin(angle * arms + dist * tightness + iTime * 0.05);
    return pow(0.5 + 0.5 * spiral, 2.0);
}

void main() {
    vec2 uv = vTexCoord;
    float radiusFactor = vColor.z;
    vec2 p = uv * 2.0 - 1.0;
    float rotation = iTime * 0.01;
    mat2 rot = mat2(
        cos(rotation), -sin(rotation),
        sin(rotation), cos(rotation)
    );
    p = rot * p;
    float dist = length(p);
    float arms = 2.0;
    float spiralFactor = spiral(p, arms, 10.0);
    float starField = fbm(p * galaxyDensity + vec2(iTime * 0.02, iTime * 0.03));
    starField = pow(starField, 3.0) * starBrightness;
    float armBrightness = spiralFactor * (1.0 - smoothstep(0.0, 1.0, dist));
    float smallStars = pow(noise(p * 20.0 + iTime * 0.01), 20.0) * 0.5;
    float largeStars = pow(noise(p * 5.0 - iTime * 0.02), 40.0);
    float core = 1.0 - smoothstep(0.0, 0.3, dist);
    float brightness = starField * armBrightness + smallStars + largeStars * 2.0 + core;
    vec4 galaxyColor1 = vec4(0.25, 0.0, 0.5, 0.7);  // Purple
    vec4 galaxyColor2 = vec4(0.08, 0.0, 0.3, 0.7);  // Deep blue
    vec4 galaxyColor3 = vec4(1.0, 0.2, 0.5, 0.7);   // Pink
    vec4 color;
    if (dist < 0.3) {
        color = mix(galaxyColor3, galaxyColor1, dist / 0.3);
    } 
    else if (spiralFactor > 0.6 && dist < 0.8) {
        color = mix(galaxyColor1, galaxyColor2, (dist - 0.3) / 0.5);
    }
    else {
        color = galaxyColor2;
    }
    color.rgb += brightness;
    color.a = min(brightness * 2.0, 1.0) * vColor.a;
    color.a *= 1.0 - smoothstep(0.8, 1.0, dist);
    gl_FragColor = color;
}
