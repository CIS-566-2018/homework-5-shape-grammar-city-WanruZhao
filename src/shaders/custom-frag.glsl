#version 300 es


precision highp float;

uniform vec4 u_Color; 
uniform vec2 u_Dimension;

in float time;

in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;

out vec4 out_Col;



// Reference: https://www.shadertoy.com/view/MscXD7
float rnd(float x)
{
    return fract(sin(dot(vec2(x+47.49,38.2467/(x+2.3)), vec2(12.9898, 78.233)))* (43758.5453));
}

// Reference: https://www.shadertoy.com/view/MscXD7
float drawCircle(vec2 center, float radius, vec2 uv)
{
    return 1.0 - smoothstep(0.0, radius, length(uv - center));
}


void main()
{
    vec2 coord = gl_FragCoord.xy;

    vec4 f = vec4(0.8, 0.5, 0, pow(coord.y / u_Dimension.y + 0.05, 2.0f) * 0.7f);

    if(coord.y / u_Dimension.y > 0.85 || coord.y / u_Dimension.y < 0.15) {
        f = vec4(1, 1, 1, 0.8);
    }


    // Reference: https://www.shadertoy.com/view/MscXD7
    vec2 uv = coord / u_Dimension;
    for(int i = 0; i < 20; i++)
    {

        float speed = 0.2 + rnd(cos(float(i))) * (0.8 + 0.5 * cos(float(i) / 5.0));
        vec2 center = vec2(mod(sin(float(i)) - speed * (time / 10.0 * 0.25), 0.6), (0.25 - uv.x) * 0.2 + rnd(float(i)) + 0.1 * cos(time / 20.0 + sin(float(i))));
        f += vec4(0.09 * drawCircle(center, 0.001 + speed * 0.01, uv));
    }

    out_Col = f;
    
}
