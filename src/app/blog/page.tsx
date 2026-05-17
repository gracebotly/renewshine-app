import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import { getAllPosts } from '@/lib/blog'

function PostImagePlaceholder({ category }: { category: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-2 p-6">
      <span className="text-xs font-semibold text-(--color-brand) uppercase tracking-widest text-center">
        {category}
      </span>
      <div className="w-10 h-10 rounded-full bg-(--color-brand-muted) flex items-center justify-center">
        <span className="text-sm font-bold text-(--color-brand)">RS</span>
      </div>
    </div>
  )
}

export default function BlogIndexPage() {
  const posts = getAllPosts()
  const [featured, ...rest] = posts

  return (
    <div className="bg-white">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-semibold text-(--color-brand) uppercase tracking-widest">
            Blog
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mt-2 mb-4">
            Cleaning Guides for the DMV
          </h1>
          <p className="text-slate-600 text-lg max-w-xl">
            Move-out checklists, pricing guides, and local cleaning advice for DC, Maryland, and Northern Virginia.
          </p>
        </div>

        {/* Featured post */}
        {featured && (
          <div className="mb-14">
            <Link href={`/blog/${featured.slug}`} className="group block">
              <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300">
                <div className="aspect-video md:aspect-auto min-h-[260px] overflow-hidden relative bg-slate-50">
                  {featured.ogImage ? (
                    <img
                      src={featured.ogImage}
                      alt={featured.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PostImagePlaceholder category={featured.category} />
                  )}
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
                  <span className="text-xs font-semibold text-(--color-brand) uppercase tracking-widest mb-3">
                    {featured.category} · Featured
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-(--color-brand) transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">
                    {featured.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-6">
                    <span>{featured.author}</span>
                    <span>·</span>
                    <span>
                      {new Date(featured.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {featured.readTime && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {featured.readTime}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-(--color-brand) group-hover:gap-3 transition-all duration-200">
                    Read article <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-bold text-slate-900">Latest Articles</h2>
              <span className="text-sm text-slate-500">{rest.length} article{rest.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <article key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="group block h-full">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-all duration-300 h-full flex flex-col">
                      <div className="aspect-video overflow-hidden flex-shrink-0 bg-slate-50">
                        {post.ogImage ? (
                          <img
                            src={post.ogImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <PostImagePlaceholder category={post.category} />
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <span className="text-xs font-semibold text-(--color-brand) uppercase tracking-widest mb-2">
                          {post.category}
                        </span>
                        <h2 className="font-display font-bold text-slate-900 mb-2 leading-snug group-hover:text-(--color-brand) transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                          {post.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-auto pt-4 border-t border-slate-100">
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {post.readTime && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {post.readTime}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}

        {posts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-slate-500">Articles coming soon.</p>
          </div>
        )}
      </main>
    </div>
  )
}
