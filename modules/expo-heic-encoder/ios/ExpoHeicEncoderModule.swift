import ExpoModulesCore
import Foundation
import ImageIO
import UIKit
import UniformTypeIdentifiers

internal final class InvalidSourceUriException: Exception, @unchecked Sendable {
  override var reason: String {
    "The provided source URI is invalid"
  }
}

internal final class UnsupportedHeicEncodingException: Exception, @unchecked Sendable {
  override var reason: String {
    "HEIC encoding is not available in this runtime"
  }
}

internal final class UnableToLoadSourceImageException: Exception, @unchecked Sendable {
  override var reason: String {
    "The source image could not be loaded for HEIC export"
  }
}

internal final class UnableToCreateHeicDestinationException: Exception, @unchecked Sendable {
  override var reason: String {
    "The HEIC destination file could not be created"
  }
}

internal final class UnableToFinalizeHeicDestinationException: Exception, @unchecked Sendable {
  override var reason: String {
    "The HEIC file could not be finalized"
  }
}

public final class ExpoHeicEncoderModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoHeicEncoder")

    Function("isHeicEncodingAvailable") {
      return Self.heicEncodingAvailable
    }

    AsyncFunction("encodeHeicAsync") { (sourceUri: String, quality: Double) -> [String: Any] in
      guard Self.heicEncodingAvailable else {
        throw UnsupportedHeicEncodingException()
      }

      guard let sourceURL = Self.resolveFileUrl(sourceUri) else {
        throw InvalidSourceUriException()
      }

      guard let image = UIImage(contentsOfFile: sourceURL.path) ?? Self.loadImage(from: sourceURL) else {
        throw UnableToLoadSourceImageException()
      }

      let renderedImage = Self.renderedImage(from: image)
      guard let cgImage = renderedImage.cgImage else {
        throw UnableToLoadSourceImageException()
      }

      let outputURL = Self.makeOutputUrl()
      let destinationType = UTType.heic.identifier as CFString

      guard let destination = CGImageDestinationCreateWithURL(outputURL as CFURL, destinationType, 1, nil) else {
        throw UnableToCreateHeicDestinationException()
      }

      let properties = [
        kCGImageDestinationLossyCompressionQuality as CFString: max(0.0, min(quality, 1.0))
      ] as CFDictionary

      CGImageDestinationAddImage(destination, cgImage, properties)

      guard CGImageDestinationFinalize(destination) else {
        throw UnableToFinalizeHeicDestinationException()
      }

      let sizeBytes = (try? outputURL.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0

      return [
        "height": cgImage.height,
        "sizeBytes": sizeBytes,
        "uri": outputURL.absoluteString,
        "width": cgImage.width
      ]
    }
  }

  private static var heicEncodingAvailable: Bool {
    let supportedTypes = CGImageDestinationCopyTypeIdentifiers() as? [String] ?? []
    return supportedTypes.contains(UTType.heic.identifier)
  }

  private static func resolveFileUrl(_ sourceUri: String) -> URL? {
    if let url = URL(string: sourceUri), url.isFileURL {
      return url
    }

    if sourceUri.hasPrefix("/") {
      return URL(fileURLWithPath: sourceUri)
    }

    return nil
  }

  private static func loadImage(from url: URL) -> UIImage? {
    guard let data = try? Data(contentsOf: url) else {
      return nil
    }

    return UIImage(data: data)
  }

  private static func renderedImage(from image: UIImage) -> UIImage {
    let pixelSize: CGSize
    if let cgImage = image.cgImage {
      pixelSize = CGSize(width: cgImage.width, height: cgImage.height)
    } else {
      pixelSize = CGSize(width: image.size.width * image.scale, height: image.size.height * image.scale)
    }

    let format = UIGraphicsImageRendererFormat.default()
    format.opaque = true
    format.scale = 1

    let renderer = UIGraphicsImageRenderer(size: pixelSize, format: format)

    return renderer.image { context in
      UIColor.white.setFill()
      context.fill(CGRect(origin: .zero, size: pixelSize))
      image.draw(in: CGRect(origin: .zero, size: pixelSize))
    }
  }

  private static func makeOutputUrl() -> URL {
    let cachesUrl = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
    return cachesUrl.appendingPathComponent("heic-export-\(UUID().uuidString).heic")
  }
}
