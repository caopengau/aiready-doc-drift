import { Metadata } from 'next';
import { generateBlogMetadata } from '../../../lib/blog-metadata';
import PostClient from './PostClient';

export const metadata: Metadata = generateBlogMetadata({
  title: 'Evolution ROI: Measuring the Infinite Value of Agentic Swarms',
  description:
    'Quantifying the value of a Living Repository. How to measure time savings and complexity reduction in an autonomous agentic system.',
  slug: 'openclaw-chronicles-13-evolution-roi',
});

export default function BlogPost() {
  return <PostClient />;
}
