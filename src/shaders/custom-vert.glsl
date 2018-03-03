#version 300 es

uniform mat4 u_Model;       

uniform mat4 u_ModelInvTr;  

uniform mat4 u_ViewProj;    

uniform vec4 u_Color;

uniform int u_Time;

in vec4 vs_Pos;             

in vec4 vs_Nor;             

in vec4 vs_Col;             

out vec4 fs_Nor;            
out vec4 fs_LightVec;       
out vec4 fs_Col;
out float time;            

const vec4 lightPos = vec4(5, 5, 20, 1); 

void main()
{
    time = float(u_Time);

    fs_Col = u_Color;                         

    mat3 invTranspose = mat3(u_ModelInvTr);

                                                         

    vec4 modelposition = u_Model * vs_Pos;

    mat4 rotationMat = mat4(vec4(cos(time / 200.0f), 0, sin(time / 200.0f), 0), 
                            vec4(0, 1, 0, 0),
                            vec4(-sin(time / 200.0f), 0, cos(time / 200.0f), 0),
                            vec4(0, 0, 0, 1));

    modelposition = rotationMat * modelposition;

    fs_Nor = vec4(normalize(invTranspose * vec3(modelposition)), 0); 

    fs_LightVec = lightPos - modelposition;  

    gl_Position = vs_Pos;
    
                                             
}
