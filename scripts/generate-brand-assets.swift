import AppKit
import Foundation

let output = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("assets")
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)

func color(_ hex: String) -> NSColor {
    let value = UInt64(hex, radix: 16)!
    return NSColor(red: CGFloat((value >> 16) & 255) / 255, green: CGFloat((value >> 8) & 255) / 255, blue: CGFloat(value & 255) / 255, alpha: 1)
}
func roundedRect(_ rect: NSRect, radius: CGFloat, fill: NSColor) {
    fill.setFill()
    NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius).fill()
}
func drawMark(in rect: NSRect, tile: Bool) {
    if tile { roundedRect(rect, radius: rect.width * 0.25, fill: color("173F35")) }
    let scale = rect.width / 1024
    let line = NSBezierPath()
    line.lineWidth = 48 * scale
    line.lineCapStyle = .round
    line.lineJoinStyle = .round
    color("F7F7F2").setStroke()
    line.move(to: NSPoint(x: rect.minX + 250 * scale, y: rect.minY + 490 * scale))
    line.line(to: NSPoint(x: rect.minX + 512 * scale, y: rect.minY + 730 * scale))
    line.line(to: NSPoint(x: rect.minX + 774 * scale, y: rect.minY + 490 * scale))
    line.stroke()
    let home = NSBezierPath()
    home.lineWidth = 42 * scale
    home.lineCapStyle = .round
    home.lineJoinStyle = .round
    color("F7F7F2").setStroke()
    home.move(to: NSPoint(x: rect.minX + 322 * scale, y: rect.minY + 472 * scale))
    home.line(to: NSPoint(x: rect.minX + 322 * scale, y: rect.minY + 285 * scale))
    home.line(to: NSPoint(x: rect.minX + 702 * scale, y: rect.minY + 285 * scale))
    home.line(to: NSPoint(x: rect.minX + 702 * scale, y: rect.minY + 472 * scale))
    home.stroke()
    roundedRect(NSRect(x: rect.minX + 469 * scale, y: rect.minY + 285 * scale, width: 86 * scale, height: 150 * scale), radius: 42 * scale, fill: color("D9CF8E"))
}
func writePNG(_ image: NSImage, name: String) throws {
    guard let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(image.size.width), pixelsHigh: Int(image.size.height), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0), let context = NSGraphicsContext(bitmapImageRep: bitmap) else { fatalError("Could not rasterize \(name)") }
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    context.imageInterpolation = .high
    image.draw(in: NSRect(origin: .zero, size: image.size))
    context.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()
    guard let data = bitmap.representation(using: .png, properties: [:]) else { fatalError("Could not encode \(name)") }
    try data.write(to: output.appendingPathComponent(name))
}

let icon = NSImage(size: NSSize(width: 1024, height: 1024))
icon.lockFocus()
NSColor(calibratedRed: CGFloat(23) / 255, green: CGFloat(63) / 255, blue: CGFloat(53) / 255, alpha: 1).setFill()
NSBezierPath(rect: NSRect(x: 0, y: 0, width: 1024, height: 1024)).fill()
drawMark(in: NSRect(x: 0, y: 0, width: 1024, height: 1024), tile: false)
icon.unlockFocus()
try writePNG(icon, name: "icon.png")

let foreground = NSImage(size: NSSize(width: 1024, height: 1024))
foreground.lockFocus()
drawMark(in: NSRect(x: 70, y: 70, width: 884, height: 884), tile: false)
foreground.unlockFocus()
try writePNG(foreground, name: "adaptive-icon.png")

let lockup = NSImage(size: NSSize(width: 960, height: 620))
lockup.lockFocus()
drawMark(in: NSRect(x: 340, y: 286, width: 280, height: 280), tile: true)
let name = NSMutableAttributedString(string: "ghar", attributes: [.font: NSFont.systemFont(ofSize: 78, weight: .bold), .foregroundColor: color("173F35")])
name.append(NSAttributedString(string: "sync", attributes: [.font: NSFont.systemFont(ofSize: 78, weight: .bold), .foregroundColor: color("287B63")]))
name.draw(at: NSPoint(x: 480 - name.size().width / 2, y: 154))
let tagline = NSAttributedString(string: "CARE FOR EVERY HOME", attributes: [.font: NSFont.systemFont(ofSize: 20, weight: .semibold), .foregroundColor: color("6F7E78"), .kern: 4])
tagline.draw(at: NSPoint(x: 480 - tagline.size().width / 2, y: 105))
lockup.unlockFocus()
try writePNG(lockup, name: "splash-lockup.png")
print("Generated icon.png, adaptive-icon.png and splash-lockup.png")
