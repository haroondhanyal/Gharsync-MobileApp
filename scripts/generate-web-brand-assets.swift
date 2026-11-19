import AppKit
import Foundation

let assets = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("assets")
try FileManager.default.createDirectory(at: assets, withIntermediateDirectories: true)

func color(_ hex: String) -> NSColor {
    let value = UInt64(hex, radix: 16)!
    return NSColor(red: CGFloat((value >> 16) & 255) / 255, green: CGFloat((value >> 8) & 255) / 255, blue: CGFloat(value & 255) / 255, alpha: 1)
}

func point(_ x: CGFloat, _ y: CGFloat, in rect: NSRect) -> NSPoint {
    let scale = rect.width / 64
    return NSPoint(x: rect.minX + x * scale, y: rect.maxY - y * scale)
}

func drawWebMark(in rect: NSRect) {
    color("287B63").setFill()
    NSBezierPath(roundedRect: rect, xRadius: rect.width * 18 / 64, yRadius: rect.width * 18 / 64).fill()

    let house = NSBezierPath()
    house.lineWidth = rect.width * 4 / 64
    house.lineCapStyle = .round
    house.lineJoinStyle = .round
    house.move(to: point(14, 29.5, in: rect))
    house.line(to: point(32, 15, in: rect))
    house.line(to: point(50, 29.5, in: rect))
    house.line(to: point(50, 48.5, in: rect))
    house.curve(to: point(47.5, 51, in: rect), controlPoint1: point(50, 50, in: rect), controlPoint2: point(49, 51, in: rect))
    house.line(to: point(16.5, 51, in: rect))
    house.curve(to: point(14, 48.5, in: rect), controlPoint1: point(15, 51, in: rect), controlPoint2: point(14, 50, in: rect))
    house.close()
    color("FFFEFA").setStroke()
    house.stroke()

    let door = NSBezierPath()
    door.lineWidth = rect.width * 4 / 64
    door.lineCapStyle = .round
    door.lineJoinStyle = .round
    door.move(to: point(27, 51, in: rect))
    door.line(to: point(27, 36, in: rect))
    door.line(to: point(37, 36, in: rect))
    door.line(to: point(37, 51, in: rect))
    color("FFFEFA").setStroke()
    door.stroke()

    let spark = NSBezierPath()
    spark.move(to: point(49, 8, in: rect))
    spark.line(to: point(50.5, 12.5, in: rect))
    spark.line(to: point(55, 14, in: rect))
    spark.line(to: point(50.5, 15.5, in: rect))
    spark.line(to: point(49, 20, in: rect))
    spark.line(to: point(47.5, 15.5, in: rect))
    spark.line(to: point(43, 14, in: rect))
    spark.line(to: point(47.5, 12.5, in: rect))
    spark.close()
    color("D9CF8E").setFill()
    spark.fill()
}

func writePNG(_ image: NSImage, name: String) throws {
    guard let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(image.size.width), pixelsHigh: Int(image.size.height), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0), let context = NSGraphicsContext(bitmapImageRep: bitmap) else { fatalError("Could not rasterize \(name)") }
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    image.draw(in: NSRect(origin: .zero, size: image.size))
    context.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()
    guard let data = bitmap.representation(using: .png, properties: [:]) else { fatalError("Could not encode \(name)") }
    try data.write(to: assets.appendingPathComponent(name))
}

let mark = NSImage(size: NSSize(width: 192, height: 192))
mark.lockFocus()
drawWebMark(in: NSRect(x: 0, y: 0, width: 192, height: 192))
mark.unlockFocus()
try writePNG(mark, name: "web-mark.png")

let lockup = NSImage(size: NSSize(width: 960, height: 320))
lockup.lockFocus()
drawWebMark(in: NSRect(x: 150, y: 80, width: 160, height: 160))
let word = NSMutableAttributedString(string: "ghar", attributes: [.font: NSFont.systemFont(ofSize: 91, weight: .semibold), .foregroundColor: color("15332F")])
word.append(NSAttributedString(string: "sync", attributes: [.font: NSFont.systemFont(ofSize: 91, weight: .medium), .foregroundColor: color("287B63")]))
word.draw(at: NSPoint(x: 344, y: 128))
let tagline = NSAttributedString(string: "HOME, IN GOOD HANDS", attributes: [.font: NSFont.systemFont(ofSize: 20, weight: .medium), .foregroundColor: color("6F7E78"), .kern: 4])
tagline.draw(at: NSPoint(x: 349, y: 88))
lockup.unlockFocus()
try writePNG(lockup, name: "splash-lockup.png")
print("Generated web-mark.png and web-style splash-lockup.png")
