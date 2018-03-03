#version 300 es

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform vec4 u_Eye;
uniform int u_Time;

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec4 fs_Pos;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

float fogDensity(vec4 e, vec4 v) {
    return clamp( sqrt(pow(e.x - v.x, 2.0) + pow(e.z - v.z, 2.0))/ 200.0, 0.0, 1.0);
}



void main()
{
    // Material base color (before shading)
        vec4 diffuseColor = fs_Col;

        // Calculate the diffuse term for Lambert shading
        float diffuseTerm = dot(normalize(fs_Nor), normalize(vec4(-1, 1, -1, 1)));
        // Avoid negative lighting values
        if(diffuseTerm < 0.001f) diffuseTerm = 0.0f;

        float ambientTerm = 0.3;

        float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.

        // Compute final shaded color
        
        //out_Col = vec4(0.5 * (normalize(fs_Nor.xyz) + vec3(1.0)), 1.0);
        vec4 color = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a); 
        vec4 f = mix(color, vec4(1.0, 0.9, 0.6, 1), fogDensity(u_Eye, fs_Pos));
        out_Col = vec4(f.xyz, (0.1 * sin(float(u_Time) / 200.0) + 0.9));


        
}
