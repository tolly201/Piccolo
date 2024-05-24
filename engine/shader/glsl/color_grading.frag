#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

void _simpleColorGrading(inout highp vec4 raw_color)
{
    lowp float u = floor(raw_color.b * 15.0f) / 15.0f * 240.0f;
    u += raw_color.r * 16.0f;
    lowp float v = (1.0f - raw_color.g) * 16.0f;
    
    u /= 256.0f;
    v /= 16.0f;
    out_color = texture(color_grading_lut_texture_sampler, vec2(u,v));
}

void _detailedColorGrading(inout highp vec4 raw_color)
{
    highp float u = floor(raw_color.b * 15.0f) / 15.0f * 240.0f;
    u += floor(raw_color.r * 15.0f) / 15.0f * 15.0f;
    highp float v = 1.0 - (floor(raw_color.g * 15.0f) / 15.0f);
    
    u /= 256.0f;
    v /= 16.0f;
    
    highp vec4 left = texture(color_grading_lut_texture_sampler, vec2(u,v));
    
    u = ceil(raw_color.b * 15.0f) / 15.0f * 240.0f;
    u += ceil(raw_color.r * 15.0f) / 15.0f * 15.0f;
    v = 1.0 - (ceil(raw_color.g * 15.0f) / 15.0f);
    
    u /= 256.0f;
    v /= 16.0f;
    highp vec4 right = texture(color_grading_lut_texture_sampler, vec2(u,v));

    out_color.r = mix(left.r, right.r, fract(raw_color.r * 15.0));
    out_color.g = mix(left.g, right.g, fract(raw_color.g * 15.0));
    out_color.b = mix(left.b, right.b, fract(raw_color.b * 15.0));
}

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
//    highp float _COLORS      = float(lut_tex_size.y);
    
    highp vec4 color       = subpassLoad(in_color).rgba;

//    color = texture(color_grading_lut_texture_sampler, uv);

//    out_color = color;
    _detailedColorGrading(color);
}


