import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Post1Content } from '@/components/blog/Post1Content'
import { Post2Content } from '@/components/blog/Post2Content'
import { Post3Content } from '@/components/blog/Post3Content'

type BlogHowToStep = { name: string; text: string }
type BlogHowTo = { name: string; description: string; steps: BlogHowToStep[] }

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return {
    title: `${post.title} | RenewShine`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: post.ogImage ? [{ url: post.ogImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.ogImage ? [post.ogImage] : [],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const related = getAllPosts()
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 2)

  const blogDir = path.join(process.cwd(), 'src', 'content', 'blog')
  const rawPath = [
    path.join(blogDir, `${slug}.mdx`),
    path.join(blogDir, `${slug}.md`),
  ].find((p) => fs.existsSync(p))
  const rawData = rawPath
    ? (matter(fs.readFileSync(rawPath, 'utf-8')).data as { howto?: BlogHowTo })
    : {}

  const faqSchema =
    post.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }
      : null

  const howtoData = rawData.howto
  const howtoSchema =
    howtoData && howtoData.steps?.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: howtoData.name,
          description: howtoData.description,
          step: howtoData.steps.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.name,
            text: s.text,
          })),
        }
      : null

  const mdxComponents = {
    Post1Content,
    Post2Content,
    Post3Content,
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.ogImage ? `https://renewshine.co${post.ogImage}` : undefined,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'RenewShine',
      url: 'https://renewshine.co',
    },
    publisher: {
      '@type': 'Organization',
      name: 'RenewShine',
      url: 'https://renewshine.co',
      logo: { '@type': 'ImageObject', url: 'https://renewshine.co/og-image.png' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://renewshine.co/blog/${post.slug}`,
    },
  }

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
        />
      )}
      {howtoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howtoSchema).replace(/</g, '\\u003c') }}
        />
      )}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        {/* Hero image */}
        {post.ogImage && (
          <div className="mb-10 -mx-4 sm:-mx-6 md:-mx-12 lg:-mx-20">
            <img
              src={post.ogImage}
              alt={post.title}
              className="w-full h-auto rounded-2xl shadow-sm"
            />
          </div>
        )}

        {/* Category + read time */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-(--color-brand) uppercase tracking-widest">
            {post.category}
          </span>
          {post.readTime && (
            <>
              <span className="text-slate-300 text-xs">·</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock size={11} />
                {post.readTime}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Author bar */}
        <div className="flex items-center gap-3 pb-8 mb-10 border-b border-slate-200">
          <div className="w-9 h-9 rounded-full bg-(--color-brand-muted) flex items-center justify-center flex-shrink-0">
            <span className="text-(--color-brand) font-bold text-sm">RS</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{post.author}</p>
            <p className="text-xs text-slate-500">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Article body */}
        <div>
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>

        {/* Divider */}
        <div className="mt-16 mb-10 border-t border-slate-200" />

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-(--color-brand-muted) border border-[color:var(--color-brand)]/20 p-8 text-center mb-16">
          <p className="font-display text-xl font-bold text-slate-900 mb-2">
            Ready for a clean you can count on?
          </p>
          <p className="text-slate-600 mb-6 text-sm">
            Submit your photos. We review and confirm your price within 24 hours — before you pay anything.
          </p>
          <Button asChild>
            <Link href="/booking">Get a Quote</Link>
          </Button>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-6">Related Articles</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group block border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {rel.ogImage && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={rel.ogImage}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-xs font-semibold text-(--color-brand) uppercase tracking-widest">
                      {rel.category}
                    </span>
                    <h4 className="font-semibold text-slate-900 mt-1 text-sm leading-snug group-hover:text-(--color-brand) transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-(--color-brand) font-medium hover:gap-3 transition-all duration-200"
              >
                View all articles <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
