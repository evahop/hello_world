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
    entryPoint: 'vs_main'
  },
  fragment: {
    module,
    entryPoint: 'fs_main',
    targets: [{ format }]
  }
})

while (true) {
  await new Promise(requestAnimationFrame)
  const encoder = device.createCommandEncoder()
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadValue: [0, 0, 0, 1],
      storeOp: 'discard'
    }]
  })
  pass.setPipeline(pipeline)
  pass.draw(3)
  pass.endPass()
  device.queue.submit([encoder.finish()])
}
