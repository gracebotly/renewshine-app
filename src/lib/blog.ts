import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface BlogFAQ {
  question: string
  answer: string
}

export interface BlogPost {
  title: string
  description: string
  slug: string
  publishedAt: string
  author: string
  category: string
  keywords: string[]
  ogImage?: string
  readTime?: string
  faq: BlogFAQ[]
  draft: boolean
  content: string
}

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog')

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))

  const posts = files
    .map((filename) => {
      const filePath = path.join(BLOG_DIR, filename)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)
      return {
        title: data.title ?? '',
        description: data.description ?? '',
        slug: data.slug ?? filename.replace(/\.mdx?$/, ''),
        publishedAt: data.publishedAt ?? '',
        author: data.author ?? 'RenewShine',
        category: data.category ?? 'General',
        keywords: data.keywords ?? [],
        ogImage: data.ogImage,
        readTime: data.readTime,
        faq: data.faq ?? [],
        draft: data.draft === true,
        content,
      } as BlogPost
    })
    .filter((post) => !post.draft)

  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug)
}
