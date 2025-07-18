// app/blog/page.tsx
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import matter from 'gray-matter'

interface Post {
    slug: string
    title: string
    date: string
}

export default function BlogPage() {
    const postsDir = path.join(process.cwd(), 'posts')
    const filenames = fs.readdirSync(postsDir).filter(f => /\.mdx?$/.test(f))

    const posts: Post[] = filenames.map(filename => {
    const file = fs.readFileSync(path.join(postsDir, filename), 'utf8')
    const { data } = matter(file)
    return {
        slug: filename.replace(/\.mdx?$/, ''),
        title: data.title,
        date: data.date
    }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
    <>
        <h2 className="text-xl font-semibold mb-4">Blog</h2>
        <ul className="list-disc pl-5 space-y-2">
        {posts.map(post => (
            <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title} <span className="text-gray-500 text-sm">({post.date})</span>
            </Link>
            </li>
        ))}
        </ul>
    </>
    )
}
