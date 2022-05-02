import { GetStaticProps } from 'next'
import React from 'react'
import PortableText from 'react-portable-text'
import Header from '../../components/Header'
import { sanityClient, urlFor } from "../../sanity"
import { Post } from '../../typing'
interface Props {
    post: Post
}

function Post({ post }: Props) {

    return (
        <main>
            <Header />

            <img
                className='object-cover w-full h-40'
                src={urlFor(post.mainImage).url()!} alt="" />

            <article className='max-w-3xl p-5 mx-auto'>
                <h1 className='mt-10 mb-3 text-3xl'>{post.title}</h1>
                <h2 className='mb-2 text-xl font-light text-gray-500'>{post.description}</h2>

                <div className="flex items-center space-x-2">
                    <img className="w-10 h-10 rounded-full" src={urlFor(post.author.image).url()!} alt="" />
                    <p className='text-sm font-extralight'>
                        Blog post by <span className='text-green-600'>{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}
                    </p>
                </div>

                <div className='mt-10'>
                    <PortableText
                        className=''
                        dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                        projectId={process.env.NEXT_PUBLIC_SANITY_ID!}
                        content={post.body}
                        serializers={
                            {

                            }
                        }
                    />

                </div>
            </article>

            <hr className='max-w-lg mx-auto my-5 border border-yellow-500 ' />

            <form className='flex flex-col max-w-2xl p-5 mx-auto mb-10'>
                <h3 className='text-sm text-yeloe-500'>Enjoyed this article?</h3>
                <h4 className='text-3xl font-bold'>Enjoyed this article?</h4>
                <hr className='py-3 mt-2' />
                <label className='block mb-5' >
                    <span className='text-gray-700'>Name</span>
                    <input className='block w-full px-3 py-2 mt-1 border rounded shadow form-input ring-yellow-500 ring' placeholder='John Carter' type="text" />
                </label>
                <label className='block mb-5' >
                    <span className='text-gray-700'>Email</span>
                    <input className='block w-full px-3 py-2 mt-1 border rounded shadow form-input ring-yellow-500 ring' placeholder='John Carter' type="text" />
                </label>
                <label className='block mb-5' >
                    <span className='text-gray-700'>Comment</span>
                    <textarea placeholder='John Carter' rows={8} />
                </label>

            </form>

        </main >
    )
}

export default Post

export const getStaticPaths = async () => {
    const query = `
    *[_type == "post"]
    {
        _id,
        slug{
             current
        }
    }`;

    const posts = await sanityClient.fetch(query);

    const paths = posts.map((post: Post) => ({
        params: {
            slug: post.slug.current
        }
    }))

    return {
        paths,
        fallback: 'blocking',
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const query = `
    *[_type == "post" && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        author->{
            name,
            image,
        },
        'comments': *[
            _type == "comment" &&
            post._ref == ^._id &&
            approved == true,
        ],
        description,
        mainImage,
        slug,
        body
    } `

    const post = await sanityClient.fetch(query, {
        slug: params?.slug,
    })

    if (!post) {
        return {
            notFound: true
        }
    }

    return {
        props: {
            post,
        }
    }
}