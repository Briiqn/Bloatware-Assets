#version 120

uniform float iTime;
uniform vec2 iResolution;

//https://www.shadertoy.com/view/4333DM
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

vec2 p1,p2;

float sdDmd(vec2 p,vec2 sz,float a){
    p = abs(p * rot(a)) - sz;
    return max(p.x,p.y);
}

float scene(vec2 p){
    p1 = vec2(sin(iTime),cos(iTime))*(sin(iTime)*0.05+0.1);
    p2 = -p1*1.0;
    float f = 0.25;
    return -f*log2(exp2(-length(p-p1)/f)-exp2(-length(p-p2)/f));
}

vec2 calcNorm(vec2 p){
    vec2 e = vec2(-1,1) * 0.0002;
    return normalize(
    e.xy * scene(e.xy + p) +
    e.yx * scene(e.yx + p) +
    e.xx * scene(e.xx + p) +
    e.yy * scene(e.yy + p)
    );
}

void mainImage(out vec4 fragColor,vec2 fragCoord){
    vec2 uv = (2.0*fragCoord-iResolution.xy)/iResolution.y;
    vec3 col = vec3(0.0);

    uv *= 0.5;

    vec2 n = calcNorm(uv);
    float g = atan(n.y,n.x);
    vec3 c = vec3(3,0,1)*(0.0025/length(uv-p1));
    c += vec3(1,0,3)*(0.0025/length(uv-p2));
    col = mix(col,c*10.0,step(sdDmd(mod(uv+0.025,0.05)-0.025,vec2(0.02,0.002),-g),0.0));
    col += c;

    fragColor = vec4(col,1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
