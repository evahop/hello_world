struct VertexIn {
    [[location(0)]] position: vec2<f32>;
    [[location(1)]] color: vec3<f32>;
};

struct VertexOut {
    [[builtin(position)]] position: vec4<f32>;
    [[location(0)]] color: vec4<f32>;
};

[[block]]
struct Uniforms {
    time: f32;
};

[[group(0), binding(0)]]
var<uniform> uniforms: Uniforms;

fn rotate(angle: f32) -> mat4x4<f32> {
    let c = cos(angle);
    let s = sin(angle);
    return mat4x4<f32>(
        vec4<f32>(  c,   s, 0.0, 0.0),
        vec4<f32>( -s,   c, 0.0, 0.0),
        vec4<f32>(0.0, 0.0, 1.0, 0.0),
        vec4<f32>(0.0, 0.0, 0.0, 1.0)
    );
}

[[stage(vertex)]]
fn vs_main(in: VertexIn) -> VertexOut {
    let rotation = rotate(uniforms.time * 0.001);
    return VertexOut(
        rotation * vec4<f32>(in.position, 0.0, 1.0),
        vec4<f32>(in.color, 1.0)
    );
}

[[stage(fragment)]]
fn fs_main(in: VertexOut) -> [[location(0)]] vec4<f32> {
    return in.color;
}
