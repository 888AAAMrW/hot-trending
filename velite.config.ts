import { defineConfig, s } from "velite";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export default defineConfig({
  root: "content",
  collections: {
    posts: {
      name: "Post",
      pattern: "blog/**/*.mdx",
      schema: s
        .object({
          title: s.string().max(120),
          date: s.isodate(),
          description: s.string().max(300),
          tags: s.array(s.string().max(30)).default([]),
          draft: s.boolean().default(false),
          content: s.markdown(),
        })
        .transform((data, { meta }) => ({
          ...data,
          slug: meta.path
            .replace(/\\/g, "/")        // normalize Windows backslashes
            .replace(/\.mdx$/, "")
            .replace(/^.*\/blog\//, ""), // strip everything before blog/
        })),
    },
  },
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    clean: true,
  },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [
        rehypePrettyCode,
        {
          theme: "github-dark",
          keepBackground: false,
          defaultLang: "plaintext",
        },
      ],
    ],
  },
});
