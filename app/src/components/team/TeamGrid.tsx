import { GetStaticProps } from 'next';
import BaseLayout from "@/layouts/BaseLayout";
import TeamMember from "@/components/team/TeamMember";

interface Post {
  slug: string;
  data: {
    name: string;
    role: string;
    avatar: {
      url: string;
    };
  };
}

interface TeamGridProps {
  posts: Post[];
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = [
    {
      slug: "cgi",
      data: {
        name: "CGI",
        role: "Smart Contracts",
        avatar: {
          url: "/images/team/cgi.jpg"
        }
      }
    },
    {
      slug: "hux",
      data: {
        name: "HUX",
        role: "Creative / UX",
        avatar: {
          url: "/images/team/hux.jpg"
        }
      }
    },
    {
      slug: "foxhood",
      data: {
        name: "Foxhood & Push Value",
        role: "UI / UX",
        avatar: {
          url: "/images/team/foxhood.jpg"
        }
      }
    }
  ];
  
  return {
    props: {
      posts
    }
  };
};

const TeamGrid = ({ posts }: TeamGridProps) => {
  return (
    // <BaseLayout>
      <section className="px-12 pb-12">
        <div
          className="p-8 lg:p-20 lg:py-32 items-center border-b-2 border-black mx-auto gap-12 h-full bg-lila-500">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-5xl lg:text-7xl text-black">Meet the Brains</p>
            <p className="max-w-xl mt-4 xl:text-2xl mx-auto tracking-tight text-black">
              <time dateTime="2020-03-16"
                >Get to know the brains behind the operation & the ones who make it all happen
              </time>
            </p>
          </div>
        </div>

        <div
          className="divide-black items-center mx-auto 2xl:border-x-2 border-black bg-black gap-0.5 grid gird-cols-1 lg:grid-cols-3">
          {posts.map((post) => (
            <TeamMember
              key={post.slug}
              url={"/team/" + post.slug}
              name={post.data.name}
              role={post.data.role}
              avatar={post.data.avatar.url}
            />
          ))}
        </div>
      </section>
    // </BaseLayout>
  );
};

export default TeamGrid;
