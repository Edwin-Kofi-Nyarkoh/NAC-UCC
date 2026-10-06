import Link from "next/link"
import { Heart, ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="py-20 lg:py-28 bg-navy-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-gold text-xs font-semibold px-4 py-2 rounded-full border border-white/10 mb-8">
          <Heart className="w-3.5 h-3.5" /> Support the Vision
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Partner with Us in{" "}
          <span className="text-gold">God&apos;s Work</span>
        </h2>

        <p className="text-silver-300 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          Your generous giving empowers our ministries, outreach programmes, and community
          development efforts on the UCC campus and beyond. Every gift makes a difference.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/give"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg text-sm"
          >
            Give Today <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors text-sm"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </section>
  )
}
