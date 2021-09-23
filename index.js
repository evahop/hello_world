const adapter = await navigator.gpu.requestAdapter()
const device = await adapter.requestDevice()

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

const context = canvas.getContext('webgpu')
const format = context.getPreferredFormat(adapter)
context.configure({ device, format })

const module = device.createShaderModule({
  code: await fetch('shader.wgsl').then(res => res.text())
})

const pipeline = device.createRenderPipeline({
  vertex: {
    module,
    entryPoint: 'vs_main',
    buffers: [{
      arrayStride: 20,
      attributes: [
        { format: 'float32x2', offset: 0, shaderLocation: 0 },
        { format: 'float32x3', offset: 8, shaderLocation: 1 }
      ]
    }]
  },
  fragment: {
    module,
    entryPoint: 'fs_main',
    targets: [{ format }]
  }
})

const vertexBuffer = device.createBuffer({
  size: 60,
  usage: GPUBufferUsage.VERTEX,
  mappedAtCreation: true
})
new Float32Array(vertexBuffer.getMappedRange()).set([
   0,  1, 1, 0, 0,
  -1, -1, 0, 1, 0,
   1, -1, 0, 0, 1
])
vertexBuffer.unmap()

const uniformBuffer = device.createBuffer({
  size: 8,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.MAP_WRITE
})
const bindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
})

while (true) {
  const time = await new Promise(requestAnimationFrame)

  await uniformBuffer.mapAsync(GPUMapMode.WRITE)
  new Float32Array(uniformBuffer.getMappedRange()).set([time])
  uniformBuffer.unmap()

  const encoder = device.createCommandEncoder()
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadValue: [0, 0, 0, 1],
      storeOp: 'discard'
    }]
  })
  pass.setPipeline(pipeline)
  pass.setVertexBuffer(0, vertexBuffer)
  pass.setBindGroup(0, bindGroup)
  pass.draw(3)
  pass.endPass()
  device.queue.submit([encoder.finish()])
}
