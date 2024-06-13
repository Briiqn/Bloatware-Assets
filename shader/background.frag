#version 120

uniform float iTime;
uniform vec2 iResolution;

mat2 rot(float a) {
    return mat2(cos(a), -sin(a), sin(a), cos(a));
}

vec2 p1, p2;

float sdDmd(vec2 p, vec2 sz, float a) {
    p = abs(p * rot(a)) - sz;
    return max(p.x, p.y);
}

float scene(vec2 p, float elapsedTime) {
    p1 = vec2(sin(elapsedTime), cos(elapsedTime)) * (sin(elapsedTime) * 0.05 + 0.1);
    p2 = -p1 * 1.0;
    float f = 0.25;
    return -f * log2(exp2(-length(p - p1) / f) - exp2(-length(p - p2) / f));
}

vec2 calcNorm(vec2 p, float elapsedTime) {
    vec2 e = vec2(-1, 1) * 0.0002;
    return normalize(
    e.xy * scene(e.xy + p, elapsedTime) +
    e.yx * scene(e.yx + p, elapsedTime) +
    e.xx * scene(e.xx + p, elapsedTime) +
    e.yy * scene(e.yy + p, elapsedTime)
    );
}

float tanhApprox(float x) {
    return (exp(2.0 * x) - 1.0) / (exp(2.0 * x) + 1.0);
}

vec2 rotate(vec2 v, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c) * v;
}

void mainImage( out vec4 o, vec2 u, float elapsedTime )
{
    vec2 v = iResolution.xy;
    u = .2*(u+u-v)/v.y;

    vec4 z = o = vec4(1,2,3,0);

    for (float a = .5, t = elapsedTime, i;
    ++i < 7.;
    o += (1. + cos(z+t))
    / length((1.+i*dot(v,v))
    * sin(1.5*u/(.5-dot(u,u)) - 9.*u.yx + t))
    )
    v = cos(++t - 7.*u*pow(a += .03, i)) - 5.*u,
    u += tanhApprox(40. * dot(u *= mat2(cos(i + .02*t - vec4(0,11,33,0))), u))
    * cos(1e2*u.yx + t) / 2e2
    + .2 * a * u
    + cos(4./exp(dot(o,o)/1e2) + t) / 3e2;

    o = 25.6 / (min(o, 13.) + 164. / o)
    - dot(u, u) / 250.;
}

void main() {
    float elapsedTime = iTime*.25;
    mainImage(gl_FragColor, gl_FragCoord.xy, elapsedTime);
}
